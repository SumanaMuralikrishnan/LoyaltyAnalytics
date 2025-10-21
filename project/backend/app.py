from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from typing import List, Dict, Any
from datetime import datetime, timedelta
import pytz
import logging
import os
import uuid
import json
from dotenv import load_dotenv
import time
from functools import wraps
from dateutil.relativedelta import relativedelta
import random
import psycopg2
from psycopg2.extras import RealDictCursor

# Initialize Flask app
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="http://localhost:5173")
load_dotenv()

# Configure minimal logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')
logging.getLogger('supabase').setLevel(logging.WARNING)
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

# Enable CORS for HTTP requests
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"], allow_headers=["Content-Type", "X-User-ID"])

# Configuration
app.config['CACHE_TYPE'] = 'simple'

try:

# Supabase connection with retry logic
    supabase: Client = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_KEY")
    )
    
    logger.info("Supabase client initialized successfully")


except Exception as e:
    logger.critical(f"Failed to initialize Supabase client: {str(e)}")
    supabase = None

# Timezone configuration
UTC = pytz.UTC

# Authentication decorator
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return jsonify({}), 204
        user_id = 'admin-1'
        logger.info(f"Authenticated request for {request.path}")
        return f(*args, **kwargs)
    return decorated

# Schema validation
def validate_schema():
    try:
        required_columns = {
            'transactions': ['date', 'points', 'customer_id', 'type', 'context', 'amount'],
            'orders': ['date', 'total', 'customer_id'],
            'referrals': ['date', 'id'],
            'campaigns': ['start_date', 'id', 'name', 'type', 'rules', 'end_date', 'status'],
            'users': ['id', 'last_activity', 'tier', 'name', 'email', 'phone', 'created_at', 'points_balance', 'points_earned'],
            'rewards': ['id', 'name', 'points_cost'],
            'campaign_participants': ['id', 'campaign_id', 'customer_id', 'joined_at'],
            'ml_predictions': ['id', 'customer_id', 'clv_predicted', 'prediction_date'],
            'pred_rew': ['ml_prediction_id', 'reward_id'],
            'promotions': ['id', 'title', 'message', 'type', 'status', 'sent_date'],
            'segments': ['id', 'name', 'description', 'count', 'avg_spend', 'avg_points', 'retention_rate', 'color']
        }
        schema_status = {}
        for table, columns in required_columns.items():
            schema_status[table] = {}
            for column in columns:
                try:
                    supabase.table(table).select(column).limit(1).execute()
                    schema_status[table][column] = "Accessible"
                except Exception as e:
                    schema_status[table][column] = f"Error: {str(e)}"
                    logger.error(f"Schema validation failed for {table}.{column}: {str(e)}")
        is_valid = all(
            'Error' not in status
            for table, cols in schema_status.items()
            for column, status in cols.items()
        )
        return is_valid, schema_status
    except Exception as e:
        logger.error(f"Schema validation error: {str(e)}")
        return False, {'error': f"Schema validation failed: {str(e)}"}

# Sanitize input
def sanitize_input(value):
    if isinstance(value, str):
        return value.replace("'", "").replace(";", "").replace("--", "")
    return value

# Parse ISO datetime
def parse_iso_datetime(date_str):
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        return dt if dt.tzinfo else dt.replace(tzinfo=UTC)
    except Exception as e:
        logger.error(f"Failed to parse datetime {date_str}: {str(e)}")
        return None

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    try:
        if not supabase:
            return jsonify({'status': 'error', 'message': 'Supabase client not initialized'}), 500
        is_valid, schema_status = validate_schema()
        if not is_valid:
            return jsonify({'status': 'error', 'message': 'Schema validation failed', 'details': schema_status}), 500
        response = supabase.table('users').select('id').limit(1).execute()
        return jsonify({
            'status': 'ok',
            'supabase': f'Connected, found {len(response.data)} users',
            'schema': schema_status,
            'timestamp': datetime.now(UTC).isoformat()
        }), 200
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# Login API
@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 204
    data = request.json
    email = sanitize_input(data.get('email'))
    password = data.get('password')
    role = data.get('role')
    
    if not email or not password or role != 'admin':
        return jsonify({'error': 'Invalid credentials'}), 400
    
    if email == 'admin@example.com':
        return jsonify({'user_id': 'admin-1', 'role': 'admin'})
    
    try:
        admin_response = supabase.table('users').select('id').eq('email', email).eq('role', 'admin').execute()
        if not admin_response.data:
            return jsonify({'error': 'Admin not found'}), 404
        return jsonify({'user_id': str(admin_response.data[0]['id']), 'role': 'admin'})
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Admin table not available, use demo credentials'}), 503

# Dashboard: KPIs (HTTP)
@app.route('/dashboard/kpis', methods=['GET', 'OPTIONS'])
@require_auth
def kpis():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        # Get current date for period calculations (using today's date)
        now = datetime.now(UTC)
        
        # Calculate financial year quarters (April-March)
        def get_financial_quarter_dates(date):
    # Financial year starts in April
            if date.month >= 4:
                fy_start_year = date.year
            else:
                fy_start_year = date.year - 1
                
            # Determine which quarter we're in (Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar)
            if date.month in [4, 5, 6]:
                quarter = 1
                quarter_start_month = 4
                quarter_end_month = 6
            elif date.month in [7, 8, 9]:
                quarter = 2
                quarter_start_month = 7
                quarter_end_month = 9
            elif date.month in [10, 11, 12]:
                quarter = 3
                quarter_start_month = 10
                quarter_end_month = 12
            else:  # Jan, Feb, Mar
                quarter = 4
                quarter_start_month = 1
                quarter_end_month = 3
                
            # Current quarter dates
            if quarter == 4:
                # Q4 spans into the next calendar year
                current_q_start = datetime(fy_start_year + 1, quarter_start_month, 1, tzinfo=UTC)
                current_q_end = datetime(fy_start_year + 1, quarter_end_month + 1, 1, tzinfo=UTC) - timedelta(days=1)
            else:
                current_q_start = datetime(fy_start_year, quarter_start_month, 1, tzinfo=UTC)
                # Handle December (Q3) case
                if quarter_end_month == 12:
                    current_q_end = datetime(fy_start_year + 1, 1, 1, tzinfo=UTC) - timedelta(days=1)
                else:
                    current_q_end = datetime(fy_start_year, quarter_end_month + 1, 1, tzinfo=UTC) - timedelta(days=1)
                    
            # Last quarter dates
            if quarter == 1:
                # Last quarter was Q4 of previous financial year
                last_q_start = datetime(fy_start_year - 1, 10, 1, tzinfo=UTC)
                last_q_end = datetime(fy_start_year, 1, 1, tzinfo=UTC) - timedelta(days=1)
            else:
                # Last quarter was previous quarter in same financial year
                last_quarter = quarter - 1
                if last_quarter == 1:
                    last_q_start = datetime(fy_start_year, 4, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year, 7, 1, tzinfo=UTC) - timedelta(days=1)
                elif last_quarter == 2:
                    last_q_start = datetime(fy_start_year, 7, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year, 10, 1, tzinfo=UTC) - timedelta(days=1)
                else:  # last_quarter == 3
                    last_q_start = datetime(fy_start_year, 10, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year + 1, 1, 1, tzinfo=UTC) - timedelta(days=1)
                    
            return current_q_start, current_q_end, last_q_start, last_q_end

        current_q_start, current_q_end, last_q_start, last_q_end = get_financial_quarter_dates(now)
        
        # Fetch data for current quarter
        current_users_response = supabase.table('users').select('points_balance, points_earned, tier').execute()
        current_orders_response = supabase.table('orders').select('total, date, customer_id').gte('date', current_q_start.isoformat()).lte('date', current_q_end.isoformat()).execute()
        current_transactions_response = supabase.table('transactions').select('points, type, date').gte('date', current_q_start.isoformat()).lte('date', current_q_end.isoformat()).execute()
        current_ml_response = supabase.table('ml_predictions').select('clv_predicted, prediction_date').gte('prediction_date', current_q_start.isoformat()).lte('prediction_date', current_q_end.isoformat()).execute()
        current_campaigns_response = supabase.table('campaigns').select('id, status').execute()
        
        # Fetch data for last quarter
        last_orders_response = supabase.table('orders').select('total, date, customer_id').gte('date', last_q_start.isoformat()).lte('date', last_q_end.isoformat()).execute()
        last_transactions_response = supabase.table('transactions').select('points, type, date').gte('date', last_q_start.isoformat()).lte('date', last_q_end.isoformat()).execute()
        last_ml_response = supabase.table('ml_predictions').select('clv_predicted, prediction_date').gte('prediction_date', last_q_start.isoformat()).lte('prediction_date', last_q_end.isoformat()).execute()
        
        # Current quarter calculations
        total_customers = len(current_users_response.data)
        total_points = sum(user['points_balance'] for user in current_users_response.data)
        avg_points = total_points / total_customers if total_customers > 0 else 0
        total_spend = sum(order['total'] for order in current_orders_response.data)
        order_count = len(current_orders_response.data)
        avg_order_value = total_spend / order_count if order_count > 0 else 0
        points_earned = sum(abs(t['points']) for t in current_transactions_response.data if t['points'] > 0)
        points_redeemed = sum(abs(t['points']) for t in current_transactions_response.data if t['points'] < 0)
        
        # CLV calculation (current quarter)
        avg_clv = sum(ml['clv_predicted'] for ml in current_ml_response.data) / len(current_ml_response.data) if current_ml_response.data else 0
        
        # Retention rate calculation (customers with orders in current quarter)
        active_customers = len(set(order['customer_id'] for order in current_orders_response.data))
        retention_rate = (active_customers / total_customers * 100) if total_customers > 0 else 0
        
        # Active campaigns (currently active)
        active_campaigns = len([c for c in current_campaigns_response.data if c['status'] == 'active'])
        
        # Last quarter calculations
        last_total_customers = total_customers  # Using same customer base for consistency
        last_total_points = total_points  # Using same customer base for consistency
        last_avg_points = last_total_points / last_total_customers if last_total_customers > 0 else 0
        last_total_spend = sum(order['total'] for order in last_orders_response.data)
        last_order_count = len(last_orders_response.data)
        last_avg_order_value = last_total_spend / last_order_count if last_order_count > 0 else 0
        last_points_earned = sum(abs(t['points']) for t in last_transactions_response.data if t['points'] > 0)
        last_points_redeemed = sum(abs(t['points']) for t in last_transactions_response.data if t['points'] < 0)
        
        # Last quarter CLV
        last_avg_clv = sum(ml['clv_predicted'] for ml in last_ml_response.data) / len(last_ml_response.data) if last_ml_response.data else 0
        
        # Last quarter retention rate (customers with orders in last quarter)
        last_active_customers = len(set(order['customer_id'] for order in last_orders_response.data))
        last_retention_rate = (last_active_customers / last_total_customers * 100) if last_total_customers > 0 else 0
        
        # Last quarter active campaigns (using same logic as current)
        last_active_campaigns = active_campaigns  # Simplified for campaigns
        
        # Calculate changes and trends (corrected percentage calculation)
        def calculate_change(current, last):
            if last == 0:
                return 0 if current == 0 else 100  # Handle division by zero
            return ((current - last) / last) * 100
        
        customers_change = calculate_change(total_customers, last_total_customers)
        avg_points_change = calculate_change(avg_points, last_avg_points)
        avg_order_value_change = calculate_change(avg_order_value, last_avg_order_value)
        points_earned_change = calculate_change(points_earned, last_points_earned)
        points_redeemed_change = calculate_change(points_redeemed, last_points_redeemed)
        retention_rate_change = retention_rate - last_retention_rate
        clv_change = calculate_change(avg_clv, last_avg_clv) if last_avg_clv != 0 else 0
        campaigns_change = active_campaigns - last_active_campaigns
        
        def get_trend(change):
            if change > 0:
                return 'up'
            elif change < 0:
                return 'down'
            else:
                return 'neutral'
        
        kpis_data = [
            {
                'title': 'Total Customers',
                'value': total_customers,
                'change': f"{'+' if customers_change > 0 else ''}{round(customers_change, 2)}% from last quarter",
                'trend': get_trend(customers_change),
                'icon': 'Users',
                'color': 'blue'
            },
            {
                'title': 'Average Points Balance',
                'value': round(avg_points, 2),
                'change': f"{'+' if avg_points_change > 0 else ''}{round(avg_points_change, 2)}% from last quarter",
                'trend': get_trend(avg_points_change),
                'icon': 'Gift',
                'color': 'green'
            },
            {
                'title': 'Average Order Value',
                'value': f"${round(avg_order_value, 2)}",
                'change': f"{'+' if avg_order_value_change > 0 else ''}{round(avg_order_value_change, 2)}% from last quarter",
                'trend': get_trend(avg_order_value_change),
                'icon': 'DollarSign',
                'color': 'yellow'
            },
            {
                'title': 'Points Earned',
                'value': points_earned,
                'change': f"{'+' if points_earned_change > 0 else ''}{round(points_earned_change, 2)}% from last quarter",
                'trend': get_trend(points_earned_change),
                'icon': 'TrendingUp',
                'color': 'cyan'
            },
            {
                'title': 'Points Redeemed',
                'value': points_redeemed,
                'change': f"{'+' if points_redeemed_change > 0 else ''}{round(points_redeemed_change, 2)}% from last quarter",
                'trend': get_trend(points_redeemed_change),
                'icon': 'Award',
                'color': 'purple'
            },
            {
                'title': 'Retention Rate',
                'value': f"{round(retention_rate, 2)}%",
                'change': f"{'+' if retention_rate_change > 0 else ''}{round(retention_rate_change, 2)}% from last quarter",
                'trend': get_trend(retention_rate_change),
                'icon': 'Percent',
                'color': 'teal'
            },
            {
                'title': 'Average CLV',
                'value': f"${round(avg_clv, 2)}",
                'change': f"{'+' if clv_change > 0 else ''}{round(clv_change, 2)}% from last quarter",
                'trend': get_trend(clv_change),
                'icon': 'DollarSign',
                'color': 'orange'
            },
            {
                'title': 'Active Campaigns',
                'value': active_campaigns,
                'change': f"{'+' if campaigns_change > 0 else ''}{campaigns_change} from last quarter",
                'trend': get_trend(campaigns_change),
                'icon': 'Megaphone',
                'color': 'blue'
            }
        ]
        return jsonify(kpis_data)
    except Exception as e:
        logger.error(f"KPIs error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Dashboard: KPIs (WebSocket)
@socketio.on('connect', namespace='/dashboard/kpis')
def kpis_connect():
    logger.info("WebSocket client connected to /dashboard/kpis")
    # Simulate authentication (hardcoded as in require_auth)
    user_id = 'admin-1'
    try:
        # Get current date for period calculations (using today's date)
        now = datetime.now(UTC)
        
        # Calculate financial year quarters (April-March)
        def get_financial_quarter_dates(date):
    # Financial year starts in April
            if date.month >= 4:
                fy_start_year = date.year
            else:
                fy_start_year = date.year - 1
                
            # Determine which quarter we're in (Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar)
            if date.month in [4, 5, 6]:
                quarter = 1
                quarter_start_month = 4
                quarter_end_month = 6
            elif date.month in [7, 8, 9]:
                quarter = 2
                quarter_start_month = 7
                quarter_end_month = 9
            elif date.month in [10, 11, 12]:
                quarter = 3
                quarter_start_month = 10
                quarter_end_month = 12
            else:  # Jan, Feb, Mar
                quarter = 4
                quarter_start_month = 1
                quarter_end_month = 3
                
            # Current quarter dates
            if quarter == 4:
                # Q4 spans into the next calendar year
                current_q_start = datetime(fy_start_year + 1, quarter_start_month, 1, tzinfo=UTC)
                current_q_end = datetime(fy_start_year + 1, quarter_end_month + 1, 1, tzinfo=UTC) - timedelta(days=1)
            else:
                current_q_start = datetime(fy_start_year, quarter_start_month, 1, tzinfo=UTC)
                # Handle December (Q3) case
                if quarter_end_month == 12:
                    current_q_end = datetime(fy_start_year + 1, 1, 1, tzinfo=UTC) - timedelta(days=1)
                else:
                    current_q_end = datetime(fy_start_year, quarter_end_month + 1, 1, tzinfo=UTC) - timedelta(days=1)
                    
            # Last quarter dates
            if quarter == 1:
                # Last quarter was Q4 of previous financial year
                last_q_start = datetime(fy_start_year - 1, 10, 1, tzinfo=UTC)
                last_q_end = datetime(fy_start_year, 1, 1, tzinfo=UTC) - timedelta(days=1)
            else:
                # Last quarter was previous quarter in same financial year
                last_quarter = quarter - 1
                if last_quarter == 1:
                    last_q_start = datetime(fy_start_year, 4, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year, 7, 1, tzinfo=UTC) - timedelta(days=1)
                elif last_quarter == 2:
                    last_q_start = datetime(fy_start_year, 7, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year, 10, 1, tzinfo=UTC) - timedelta(days=1)
                else:  # last_quarter == 3
                    last_q_start = datetime(fy_start_year, 10, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year + 1, 1, 1, tzinfo=UTC) - timedelta(days=1)
                    
            return current_q_start, current_q_end, last_q_start, last_q_end

        current_q_start, current_q_end, last_q_start, last_q_end = get_financial_quarter_dates(now)
        
        # Fetch data for current quarter
        current_users_response = supabase.table('users').select('points_balance, points_earned, tier').execute()
        current_orders_response = supabase.table('orders').select('total, date, customer_id').gte('date', current_q_start.isoformat()).lte('date', current_q_end.isoformat()).execute()
        current_transactions_response = supabase.table('transactions').select('points, type, date').gte('date', current_q_start.isoformat()).lte('date', current_q_end.isoformat()).execute()
        current_ml_response = supabase.table('ml_predictions').select('clv_predicted, prediction_date').gte('prediction_date', current_q_start.isoformat()).lte('prediction_date', current_q_end.isoformat()).execute()
        current_campaigns_response = supabase.table('campaigns').select('id, status').execute()
        
        # Fetch data for last quarter
        last_orders_response = supabase.table('orders').select('total, date, customer_id').gte('date', last_q_start.isoformat()).lte('date', last_q_end.isoformat()).execute()
        last_transactions_response = supabase.table('transactions').select('points, type, date').gte('date', last_q_start.isoformat()).lte('date', last_q_end.isoformat()).execute()
        last_ml_response = supabase.table('ml_predictions').select('clv_predicted, prediction_date').gte('prediction_date', last_q_start.isoformat()).lte('prediction_date', last_q_end.isoformat()).execute()
        
        # Current quarter calculations
        total_customers = len(current_users_response.data)
        total_points = sum(user['points_balance'] for user in current_users_response.data)
        avg_points = total_points / total_customers if total_customers > 0 else 0
        total_spend = sum(order['total'] for order in current_orders_response.data)
        order_count = len(current_orders_response.data)
        avg_order_value = total_spend / order_count if order_count > 0 else 0
        points_earned = sum(abs(t['points']) for t in current_transactions_response.data if t['points'] > 0)
        points_redeemed = sum(abs(t['points']) for t in current_transactions_response.data if t['points'] < 0)
        
        # CLV calculation (current quarter)
        avg_clv = sum(ml['clv_predicted'] for ml in current_ml_response.data) / len(current_ml_response.data) if current_ml_response.data else 0
        
        # Retention rate calculation (customers with orders in current quarter)
        active_customers = len(set(order['customer_id'] for order in current_orders_response.data))
        retention_rate = (active_customers / total_customers * 100) if total_customers > 0 else 0
        
        # Active campaigns (currently active)
        active_campaigns = len([c for c in current_campaigns_response.data if c['status'] == 'active'])
        
        # Last quarter calculations
        last_total_customers = total_customers  # Using same customer base for consistency
        last_total_points = total_points  # Using same customer base for consistency
        last_avg_points = last_total_points / last_total_customers if last_total_customers > 0 else 0
        last_total_spend = sum(order['total'] for order in last_orders_response.data)
        last_order_count = len(last_orders_response.data)
        last_avg_order_value = last_total_spend / last_order_count if last_order_count > 0 else 0
        last_points_earned = sum(abs(t['points']) for t in last_transactions_response.data if t['points'] > 0)
        last_points_redeemed = sum(abs(t['points']) for t in last_transactions_response.data if t['points'] < 0)
        
        # Last quarter CLV
        last_avg_clv = sum(ml['clv_predicted'] for ml in last_ml_response.data) / len(last_ml_response.data) if last_ml_response.data else 0
        
        # Last quarter retention rate (customers with orders in last quarter)
        last_active_customers = len(set(order['customer_id'] for order in last_orders_response.data))
        last_retention_rate = (last_active_customers / last_total_customers * 100) if last_total_customers > 0 else 0
        
        # Last quarter active campaigns (using same logic as current)
        last_active_campaigns = active_campaigns  # Simplified for campaigns
        
        # Calculate changes and trends (corrected percentage calculation)
        def calculate_change(current, last):
            if last == 0:
                return 0 if current == 0 else 100  # Handle division by zero
            return ((current - last) / last) * 100
        
        customers_change = calculate_change(total_customers, last_total_customers)
        avg_points_change = calculate_change(avg_points, last_avg_points)
        avg_order_value_change = calculate_change(avg_order_value, last_avg_order_value)
        points_earned_change = calculate_change(points_earned, last_points_earned)
        points_redeemed_change = calculate_change(points_redeemed, last_points_redeemed)
        retention_rate_change = retention_rate - last_retention_rate
        clv_change = calculate_change(avg_clv, last_avg_clv) if last_avg_clv != 0 else 0
        campaigns_change = active_campaigns - last_active_campaigns
        
        def get_trend(change):
            if change > 0:
                return 'up'
            elif change < 0:
                return 'down'
            else:
                return 'neutral'
        
        kpis_data = [
            {
                'title': 'Total Customers',
                'value': total_customers,
                'change': f"{'+' if customers_change > 0 else ''}{round(customers_change, 2)}% from last quarter",
                'trend': get_trend(customers_change),
                'icon': 'Users',
                'color': 'blue'
            },
            {
                'title': 'Average Points Balance',
                'value': round(avg_points, 2),
                'change': f"{'+' if avg_points_change > 0 else ''}{round(avg_points_change, 2)}% from last quarter",
                'trend': get_trend(avg_points_change),
                'icon': 'Gift',
                'color': 'green'
            },
            {
                'title': 'Average Order Value',
                'value': f"${round(avg_order_value, 2)}",
                'change': f"{'+' if avg_order_value_change > 0 else ''}{round(avg_order_value_change, 2)}% from last quarter",
                'trend': get_trend(avg_order_value_change),
                'icon': 'DollarSign',
                'color': 'yellow'
            },
            {
                'title': 'Points Earned',
                'value': points_earned,
                'change': f"{'+' if points_earned_change > 0 else ''}{round(points_earned_change, 2)}% from last quarter",
                'trend': get_trend(points_earned_change),
                'icon': 'TrendingUp',
                'color': 'cyan'
            },
            {
                'title': 'Points Redeemed',
                'value': points_redeemed,
                'change': f"{'+' if points_redeemed_change > 0 else ''}{round(points_redeemed_change, 2)}% from last quarter",
                'trend': get_trend(points_redeemed_change),
                'icon': 'Award',
                'color': 'purple'
            },
            {
                'title': 'Retention Rate',
                'value': f"{round(retention_rate, 2)}%",
                'change': f"{'+' if retention_rate_change > 0 else ''}{round(retention_rate_change, 2)}% from last quarter",
                'trend': get_trend(retention_rate_change),
                'icon': 'Percent',
                'color': 'teal'
            },
            {
                'title': 'Average CLV',
                'value': f"${round(avg_clv, 2)}",
                'change': f"{'+' if clv_change > 0 else ''}{round(clv_change, 2)}% from last quarter",
                'trend': get_trend(clv_change),
                'icon': 'DollarSign',
                'color': 'orange'
            },
            {
                'title': 'Active Campaigns',
                'value': active_campaigns,
                'change': f"{'+' if campaigns_change > 0 else ''}{campaigns_change} from last quarter",
                'trend': get_trend(campaigns_change),
                'icon': 'Megaphone',
                'color': 'blue'
            }
        ]
        emit('kpis_data', kpis_data)
    except Exception as e:
        logger.error(f"WebSocket KPIs error: {str(e)}")
        emit('error', {'error': str(e)})

@socketio.on('disconnect', namespace='/dashboard/kpis')
def kpis_disconnect():
    logger.info("WebSocket client disconnected from /dashboard/kpis")

# Campaigns
@app.route('/campaigns', methods=['GET', 'OPTIONS'])
@require_auth
def campaigns():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        # Fetch campaigns with rules, points_issued, and total_revenue
        campaigns_response = supabase.table('campaigns').select('id, name, type, status, start_date, end_date, rules, points_issued, total_revenue').execute()
        campaigns_data = []

        for campaign in campaigns_response.data:
            # Fetch participant count from participants table
            participants_response = supabase.table('campaign_participants').select('count').eq('campaign_id', campaign['id']).execute()
            participants = participants_response.data[0].get('count', 0) if participants_response.data else 0

            campaigns_data.append({
                'id': campaign['id'],
                'name': campaign['name'],
                'type': campaign['type'],
                'status': campaign['status'],
                'startDate': campaign['start_date'],
                'endDate': campaign['end_date'],
                'rules': campaign['rules'],
                'participants': participants,
                'pointsIssued': campaign['points_issued'],
                'total_revenue': round(float(campaign['total_revenue']), 2) if campaign['total_revenue'] is not None else 0.0
            })

        logger.info(f"Returning campaigns: {campaigns_data}")
        return jsonify(campaigns_data)
    except Exception as e:
        logger.error(f"Campaigns error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
# Promotions
@app.route('/promotions', methods=['GET', 'OPTIONS'])
@require_auth
def promotions():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        promotions_response = supabase.table('promotions').select('id, title, message, type, status, sent_date, target_tier').execute()
        promotions_data = []
        for promo in promotions_response.data:
            sent_date = parse_iso_datetime(promo['sent_date']) if promo['sent_date'] else datetime.now(UTC)
            end_date = (sent_date + timedelta(days=30)).isoformat() if sent_date else None
            promotions_data.append({
                'id': promo['id'],
                'name': promo['title'],
                'type': promo['type'],
                'status': promo['status'],
                'startDate': promo['sent_date'],
                'endDate': end_date,
                'description': promo['message'] or f"{promo['type'].capitalize()} for {promo['target_tier'] or 'all'} customers"
            })
        return jsonify(promotions_data)
    except Exception as e:
        logger.error(f"Promotions error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Transactions
@app.route('/transactions', methods=['GET', 'OPTIONS'])
@require_auth
def transactions():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        search = sanitize_input(request.args.get('search', ''))
        type_filter = sanitize_input(request.args.get('type', 'all'))
        date_range = int(sanitize_input(request.args.get('date_range', '1825')))
        logger.debug(f"Parameters: search={search}, type={type_filter}, date_range={date_range}")

        transactions_data = []
        total_points = 0
        total_value = 0

        # Query transactions table for non-referral transactions
        if type_filter != 'referral':
            query = supabase.table('transactions').select('id, customer_id, type, amount, context, date, users!customer_id(name)')
            if search:
                query = query.ilike('customer_id', f'%{search}%')
            if type_filter != 'all':
                query = query.ilike('type', type_filter)  # Use type_filter directly
            if date_range:
                start_date = (datetime.now(UTC) - timedelta(days=date_range)).isoformat()
                query = query.gte('date', start_date)
            
            transactions_response = query.execute()
            logger.debug(f"Transactions query returned {len(transactions_response.data)} rows")

            for t in transactions_response.data:
                if not isinstance(t, dict) or not all(key in t for key in ['id', 'customer_id', 'type', 'amount', 'context', 'date']):
                    logger.warning(f"Skipping invalid transaction record: {t}")
                    continue
                try:
                    amount = float(t['amount']) if t['amount'] is not None else 0.0
                    if t['type'] == 'welcome_bonus':
                        points = 80.0  # Fixed 80 points for welcome_bonus
                    elif t['type'] == 'birthday_bonus':
                        points = 50.0  # Example: Fixed 50 points for birthday_bonus (adjust as needed)
                    else:
                        points = amount * 0.01  # 1% of amount for other types
                    if t['type'] in ['welcome_bonus', 'birthday_bonus']:
                        logger.debug(f"{t['type']} transaction: amount={amount}, points={points}")
                except (ValueError, TypeError):
                    logger.warning(f"Invalid amount in transaction record: {t}")
                    continue
                transactions_data.append({
                    'id': t['id'],
                    'customerId': t['customer_id'],
                    'customerName': t.get('users', {}).get('name', 'Unknown'),
                    'type': t['type'],  # Use database type directly
                    'points': points,
                    'amount': amount,
                    'description': t['context'] or 'No description',
                    'date': t['date'],
                    'status': 'completed'
                })
                total_points += points
                total_value += amount

        # Query referrals table for referral transactions
        if type_filter in ['referral', 'all']:
            referral_query = supabase.table('referrals').select('id, referrer_id, reward_points, date, status, users!referrer_id(name)')
            if search:
                referral_query = referral_query.ilike('referrer_id', f'%{search}%')
            if date_range:
                start_date = (datetime.now(UTC) - timedelta(days=date_range)).isoformat()
                referral_query = referral_query.gte('date', start_date)
            
            referrals_response = referral_query.execute()
            logger.debug(f"Referrals query returned {len(referrals_response.data)} rows")

            for r in referrals_response.data:
                if not isinstance(r, dict) or not all(key in r for key in ['id', 'referrer_id', 'reward_points', 'date', 'status']):
                    logger.warning(f"Skipping invalid referral record: {r}")
                    continue
                try:
                    points = float(r['reward_points']) if r['reward_points'] is not None else 0.0
                except (ValueError, TypeTypeError):
                    logger.warning(f"Invalid reward_points in referral record: {r}")
                    continue
                transactions_data.append({
                    'id': r['id'],
                    'customerId': r['referrer_id'],
                    'customerName': r.get('users', {}).get('name', 'Unknown'),
                    'type': 'referral',
                    'points': points,
                    'amount': 0.0,
                    'description': 'Referral bonus',
                    'date': r['date'],
                    'status': r['status']
                })
                total_points += points
                total_value += 0.0

        stats = {
            'totalTransactions': len(transactions_data),
            'totalPoints': total_points,
            'totalValue': round(total_value, 2),
        }
        
        logger.debug(f"Returning {len(transactions_data)} transactions with stats: {stats}")
        return jsonify({'transactions': transactions_data, 'stats': stats}), 200
    except Exception as e:
        logger.error(f"Transactions error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
# Dashboard: Customers
@app.route('/dashboard/customers', methods=['GET', 'OPTIONS'])
@require_auth
def customers():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        users_response = supabase.table('users').select('id, email, name, tier, points_balance').execute()
        transactions_response = supabase.table('transactions').select('customer_id, amount, date').execute()
        user_segments_response = supabase.table('user_segments').select('customer_id, segment_id').execute()
        segments_response = supabase.table('segments').select('id, name').execute()

        customer_data = []
        for user in users_response.data:
            if not isinstance(user, dict) or not all(key in user for key in ['id', 'email', 'name', 'tier', 'points_balance']):
                continue
            customer_id = user['id']
            # Get segment name
            segment_id = next(
                (us['segment_id'] for us in user_segments_response.data if isinstance(us, dict) and us.get('customer_id') == customer_id),
                None
            )
            segment_name = next(
                (s['name'] for s in segments_response.data if isinstance(s, dict) and s.get('id') == segment_id),
                'Unknown'
            )
            # Calculate total spend
            customer_transactions = [
                t for t in transactions_response.data
                if isinstance(t, dict) and t.get('customer_id') == customer_id and 'amount' in t
            ]
            total_spend = sum(t['amount'] for t in customer_transactions if isinstance(t, dict) and t.get('amount', 0) > 0)
            # Get last activity
            last_activity = max(
                (parse_iso_datetime(t['date']) for t in customer_transactions if isinstance(t, dict) and 'date' in t and parse_iso_datetime(t['date'])),
                default=datetime.now(UTC)
            ).isoformat()
            # Simulate churn risk and retention rate
            recent_activity = len([
                t for t in customer_transactions
                if isinstance(t, dict) and 'date' in t and (dt := parse_iso_datetime(t['date'])) is not None and
                dt >= datetime.now(UTC) - timedelta(days=90)
            ])
            churn_risk = round(100 - (recent_activity / max(len(customer_transactions), 1) * 100), 2) if customer_transactions else 50
            retention_rate = round(recent_activity / max(len(customer_transactions), 1) * 100, 2) if customer_transactions else 50
            customer_data.append({
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'tier': user['tier'],
                'points': user['points_balance'],
                'spend': total_spend,
                'lastActivity': last_activity,
                'segment': segment_name,
                'churnRisk': churn_risk,
                'retentionRate': retention_rate
            })
        return jsonify(customer_data)
    except Exception as e:
        logger.error(f"Customers error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Dashboard: Additional KPIs (HTTP)
@app.route('/dashboard/kpis/additional', methods=['GET', 'OPTIONS'])
@require_auth
def additional_kpis():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        # Get current date for period calculations (using today's date)
        now = datetime.now(UTC)
        
        # Calculate financial year quarters (April-March)
        def get_financial_quarter_dates(date):
    # Financial year starts in April
            if date.month >= 4:
                fy_start_year = date.year
            else:
                fy_start_year = date.year - 1
                
            # Determine which quarter we're in (Q1=Apr-Jun, Q2=Jul-Sep, Q3=Oct-Dec, Q4=Jan-Mar)
            if date.month in [4, 5, 6]:
                quarter = 1
                quarter_start_month = 4
                quarter_end_month = 6
            elif date.month in [7, 8, 9]:
                quarter = 2
                quarter_start_month = 7
                quarter_end_month = 9
            elif date.month in [10, 11, 12]:
                quarter = 3
                quarter_start_month = 10
                quarter_end_month = 12
            else:  # Jan, Feb, Mar
                quarter = 4
                quarter_start_month = 1
                quarter_end_month = 3
                
            # Current quarter dates
            if quarter == 4:
                # Q4 spans into the next calendar year
                current_q_start = datetime(fy_start_year + 1, quarter_start_month, 1, tzinfo=UTC)
                current_q_end = datetime(fy_start_year + 1, quarter_end_month + 1, 1, tzinfo=UTC) - timedelta(days=1)
            else:
                current_q_start = datetime(fy_start_year, quarter_start_month, 1, tzinfo=UTC)
                # Handle December (Q3) case
                if quarter_end_month == 12:
                    current_q_end = datetime(fy_start_year + 1, 1, 1, tzinfo=UTC) - timedelta(days=1)
                else:
                    current_q_end = datetime(fy_start_year, quarter_end_month + 1, 1, tzinfo=UTC) - timedelta(days=1)
                    
            # Last quarter dates
            if quarter == 1:
                # Last quarter was Q4 of previous financial year
                last_q_start = datetime(fy_start_year - 1, 10, 1, tzinfo=UTC)
                last_q_end = datetime(fy_start_year, 1, 1, tzinfo=UTC) - timedelta(days=1)
            else:
                # Last quarter was previous quarter in same financial year
                last_quarter = quarter - 1
                if last_quarter == 1:
                    last_q_start = datetime(fy_start_year, 4, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year, 7, 1, tzinfo=UTC) - timedelta(days=1)
                elif last_quarter == 2:
                    last_q_start = datetime(fy_start_year, 7, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year, 10, 1, tzinfo=UTC) - timedelta(days=1)
                else:  # last_quarter == 3
                    last_q_start = datetime(fy_start_year, 10, 1, tzinfo=UTC)
                    last_q_end = datetime(fy_start_year + 1, 1, 1, tzinfo=UTC) - timedelta(days=1)
                    
            return current_q_start, current_q_end, last_q_start, last_q_end

        current_q_start, current_q_end, last_q_start, last_q_end = get_financial_quarter_dates(now)
        
        # Fetch data for current quarter
        current_feedback_response = supabase.table('feedback').select('nps_score, date').gte('date', current_q_start.isoformat()).lte('date', current_q_end.isoformat()).execute()
        current_referrals_response = supabase.table('referrals').select('id, date').gte('date', current_q_start.isoformat()).lte('date', current_q_end.isoformat()).execute()
        current_users_response = supabase.table('users').select('id, created_at').gte('created_at', current_q_start.isoformat()).lte('created_at', current_q_end.isoformat()).execute()
        current_ml_response = supabase.table('ml_predictions').select('churn_probability, prediction_date').gte('prediction_date', current_q_start.isoformat()).lte('prediction_date', current_q_end.isoformat()).execute()
        current_orders_response = supabase.table('orders').select('id, customer_id, date').gte('date', current_q_start.isoformat()).lte('date', current_q_end.isoformat()).execute()
        
        # Fetch data for last quarter
        last_feedback_response = supabase.table('feedback').select('nps_score, date').gte('date', last_q_start.isoformat()).lte('date', last_q_end.isoformat()).execute()
        last_referrals_response = supabase.table('referrals').select('id, date').gte('date', last_q_start.isoformat()).lte('date', last_q_end.isoformat()).execute()
        last_users_response = supabase.table('users').select('id, created_at').gte('created_at', last_q_start.isoformat()).lte('created_at', last_q_end.isoformat()).execute()
        last_ml_response = supabase.table('ml_predictions').select('churn_probability, prediction_date').gte('prediction_date', last_q_start.isoformat()).lte('prediction_date', last_q_end.isoformat()).execute()
        last_orders_response = supabase.table('orders').select('id, customer_id, date').gte('date', last_q_start.isoformat()).lte('date', last_q_end.isoformat()).execute()
        
        # Calculate Average NPS Score
        current_avg_nps = sum(f['nps_score'] for f in current_feedback_response.data) / len(current_feedback_response.data) if current_feedback_response.data else 0
        last_avg_nps = sum(f['nps_score'] for f in last_feedback_response.data) / len(last_feedback_response.data) if last_feedback_response.data else 0
        nps_change = ((current_avg_nps - last_avg_nps) / last_avg_nps * 100) if last_avg_nps != 0 else 0
        nps_trend = 'up' if nps_change > 0 else 'down' if nps_change < 0 else 'neutral'
        
        # Calculate Referral Rate
        current_referral_customers = len(set(r['id'] for r in current_referrals_response.data))
        current_total_new_customers = len(current_users_response.data)
        current_referral_rate = (current_referral_customers / current_total_new_customers * 100) if current_total_new_customers > 0 else 0
        
        last_referral_customers = len(set(r['id'] for r in last_referrals_response.data))
        last_total_new_customers = len(last_users_response.data)
        last_referral_rate = (last_referral_customers / last_total_new_customers * 100) if last_total_new_customers > 0 else 0
        
        referral_rate_change = current_referral_rate - last_referral_rate
        referral_rate_trend = 'up' if referral_rate_change > 0 else 'down' if referral_rate_change < 0 else 'neutral'
        
        # Calculate Average Churn Risk
        current_avg_churn = sum(ml['churn_probability'] for ml in current_ml_response.data) / len(current_ml_response.data) if current_ml_response.data else 0
        last_avg_churn = sum(ml['churn_probability'] for ml in last_ml_response.data) / len(last_ml_response.data) if last_ml_response.data else 0
        churn_change = ((current_avg_churn - last_avg_churn) / last_avg_churn * 100) if last_avg_churn != 0 else 0
        churn_trend = 'up' if churn_change > 0 else 'down' if churn_change < 0 else 'neutral'
        
        # Calculate Repeat Purchase Rate
        # Count customers with multiple orders in current quarter
        current_customer_orders = {}
        for order in current_orders_response.data:
            customer_id = order['customer_id']
            if customer_id not in current_customer_orders:
                current_customer_orders[customer_id] = 0
            current_customer_orders[customer_id] += 1
        current_repeat_customers = sum(1 for count in current_customer_orders.values() if count > 1)
        current_repeat_rate = (current_repeat_customers / len(current_customer_orders) * 100) if current_customer_orders else 0
        
        # Count customers with multiple orders in last quarter
        last_customer_orders = {}
        for order in last_orders_response.data:
            customer_id = order['customer_id']
            if customer_id not in last_customer_orders:
                last_customer_orders[customer_id] = 0
            last_customer_orders[customer_id] += 1
        last_repeat_customers = sum(1 for count in last_customer_orders.values() if count > 1)
        last_repeat_rate = (last_repeat_customers / len(last_customer_orders) * 100) if last_customer_orders else 0
        
        repeat_rate_change = current_repeat_rate - last_repeat_rate
        repeat_rate_trend = 'up' if repeat_rate_change > 0 else 'down' if repeat_rate_change < 0 else 'neutral'
        
        # Format the additional KPIs data
        additional_kpis_data = [
            {
                'title': 'Average NPS Score',
                'value': round(current_avg_nps, 2),
                'change': f"{'+' if nps_change > 0 else ''}{round(nps_change, 2)}% from last quarter",
                'trend': nps_trend,
                'icon': 'Smile',
                'color': 'green'
            },
            {
                'title': 'Referral Rate',
                'value': f"{round(current_referral_rate, 2)}%",
                'change': f"{'+' if referral_rate_change > 0 else ''}{round(referral_rate_change, 2)}% from last quarter",
                'trend': referral_rate_trend,
                'icon': 'Share2',
                'color': 'blue'
            },
            {
                'title': 'Average Churn Risk',
                'value': f"{round(current_avg_churn * 100, 2)}%",
                'change': f"{'+' if churn_change > 0 else ''}{round(churn_change, 2)}% from last quarter",
                'trend': churn_trend,
                'icon': 'AlertTriangle',
                'color': 'red'
            },
            {
                'title': 'Repeat Purchase Rate',
                'value': f"{round(current_repeat_rate, 2)}%",
                'change': f"{'+' if repeat_rate_change > 0 else ''}{round(repeat_rate_change, 2)}% from last quarter",
                'trend': repeat_rate_trend,
                'icon': 'Repeat',
                'color': 'purple'
            }
        ]
        
        return jsonify(additional_kpis_data)
    except Exception as e:
        logger.error(f"Additional KPIs error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Dashboard: Charts
@app.route('/dashboard/charts', methods=['GET', 'OPTIONS'])
@require_auth
def charts():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        # Get date range from query parameters (optional)
        start_date_str = request.args.get('start_date')
        end_date_str = request.args.get('end_date')
        start_date = parse_iso_datetime(start_date_str) if start_date_str else None
        end_date = parse_iso_datetime(end_date_str) if end_date_str else None
        logger.info(f"Date range: start_date={start_date_str}, end_date={end_date_str}")

        # Fetch data from Supabase tables
        transactions_response = supabase.table('transactions').select('points, type, date, context, customer_id').execute()
        users_response = supabase.table('users').select('tier, points_balance, id').execute()
        campaigns_response = supabase.table('campaigns').select('id, name').execute()
        campaign_participants_response = supabase.table('campaign_participants').select('campaign_id, joined_at').execute()
        segments_response = supabase.table('segments').select('id, name').execute()
        rewards_response = supabase.table('rewards').select('id, name').execute()
        orders_response = supabase.table('orders').select('subtotal, date').execute()
        referrals_response = supabase.table('referrals').select('reward_points, date').execute()

        logger.debug(f"Processing {len(transactions_response.data)} transactions")
        for t in transactions_response.data:
            logger.debug(f"Transaction: id={t.get('id')}, type={t.get('type')}, context={t.get('context')}, date={t.get('date')}")

    

        # Log transactions with welcome_bonus type
        welcome_transactions = [
            t for t in transactions_response.data
            if isinstance(t, dict) and 'type' in t and 'welcome_bonus' in t.get('type', '').lower()
        ]
        logger.info(f"Welcome Bonus Transactions: {welcome_transactions}")

        # Generate months for the last 12 months
        months = [(datetime.now(UTC) - relativedelta(months=i)).strftime('%b %Y') for i in range(11, -1, -1)]

        # Points Activity (Earned vs Redeemed)
        earned = []
        redeemed = []
        for month in months:
            month_start = datetime.strptime(month, '%b %Y').replace(day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=UTC)
            month_end = month_start + relativedelta(months=1) - timedelta(seconds=1)
            month_transactions = [
                t for t in transactions_response.data
                if isinstance(t, dict) and 'date' in t and (dt := parse_iso_datetime(t['date'])) is not None
                and month_start <= dt <= month_end
            ]
            earned.append(sum(t.get('points', 0) or 0 for t in month_transactions if isinstance(t, dict) and t.get('type', '').lower() in ['earn_points', 'welcome_bonus'] and t.get('points', 0) > 0))
            redeem_sum = sum(t.get('points', 0) or 0 for t in month_transactions if isinstance(t, dict) and t.get('type', '').lower() == 'redeem_points' and t.get('points', 0) < 0)
            redeemed.append(abs(redeem_sum))

        # Total Sales Over Time (from orders table, using subtotal)
        sales = [0.0] * 12
        for order in orders_response.data:
            if not isinstance(order, dict) or not all(key in order for key in ['subtotal', 'date']):
                continue
            order_date = parse_iso_datetime(order['date'])
            if not order_date:
                continue
            subtotal = float(order['subtotal']) if order['subtotal'] is not None else 0.0
            month_str = order_date.strftime('%b %Y')
            if month_str in months:
                month_idx = months.index(month_str)
                sales[month_idx] += subtotal

        # Tier Distribution
        tier_counts = {'Bronze': 0, 'Silver': 0, 'Gold': 0}
        for user in users_response.data:
            if not isinstance(user, dict) or 'tier' not in user:
                continue
            tier = user['tier']
            if tier in tier_counts:
                tier_counts[tier] += 1

        # Customer Segments
        segment_labels = [s['name'] for s in segments_response.data if isinstance(s, dict) and 'name' in s]
        segment_data = []
        for segment in segments_response.data:
            if not isinstance(segment, dict) or 'id' not in segment:
                continue
            segment_id = segment['id']
            count = len([
                us for us in supabase.table('user_segments').select('customer_id').eq('segment_id', segment_id).execute().data
                if isinstance(us, dict) and 'customer_id' in us
            ])
            segment_data.append(count)

        # Reward Popularity
        reward_counts = {}
        for t in transactions_response.data:
            if not isinstance(t, dict) or not all(key in t for key in ['type', 'context']) or t['type'] != 'redeem_points' or not t['context']:
                logger.debug(f"Skipped transaction: id={t.get('id')}, type={t.get('type')}, context={t.get('context')}")
                continue
            try:
                reward_id = t['context'].split()[-1]
                logger.debug(f"Parsed reward_id: {reward_id} from context: {t['context']}")
                reward_counts[reward_id] = reward_counts.get(reward_id, 0) + 1
            except Exception as e:
                logger.warning(f"Failed to parse context '{t['context']}': {str(e)}")
                continue
        logger.debug(f"Reward counts: {reward_counts}")
        reward_popularity = [
            {'name': r['name'], 'score': reward_counts.get(r['id'], 0)}
            for r in rewards_response.data if isinstance(r, dict) and 'id' in r and 'name' in r
        ]
        logger.debug(f"Reward popularity: {reward_popularity}")

        # Campaign Engagement
        campaign_engagement = []
        for campaign in campaigns_response.data:
            if not isinstance(campaign, dict) or 'id' not in campaign or 'name' not in campaign:
                continue
            participants = len([
                p for p in campaign_participants_response.data
                if isinstance(p, dict) and 'campaign_id' in p and p['campaign_id'] == campaign['id']
            ])
            campaign_engagement.append({'name': campaign['name'], 'participants': participants})

        # Campaign Participation Over Time
        participation_data = []
        for campaign in campaigns_response.data:
            if not isinstance(campaign, dict) or 'id' not in campaign or 'name' not in campaign:
                continue
            monthly_counts = []
            for month in months:
                month_start = datetime.strptime(month, '%b %Y').replace(day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=UTC)
                month_end = month_start + relativedelta(months=1) - timedelta(seconds=1)
                count = len([
                    p for p in campaign_participants_response.data
                    if isinstance(p, dict) and 'campaign_id' in p and 'joined_at' in p
                    and p['campaign_id'] == campaign['id']
                    and (join_date := parse_iso_datetime(p['joined_at'])) is not None
                    and month_start <= join_date <= month_end
                ])
                monthly_counts.append(count)
            participation_data.append({
                'label': campaign['name'],
                'data': monthly_counts,
                'backgroundColor': f'rgba({random.randint(0, 255)}, {random.randint(0, 255)}, {random.randint(0, 255)}, 0.5)',
                'borderColor': f'rgb({random.randint(0, 255)}, {random.randint(0, 255)}, {random.randint(0, 255)})',
                'borderWidth': 1
            })

        # Engagement by Tier
        engagement_by_tier = []
        for tier in ['Bronze', 'Silver', 'Gold']:
            tier_users = [u['id'] for u in users_response.data if isinstance(u, dict) and u.get('tier') == tier and 'id' in u]
            tier_transactions = [
                t for t in transactions_response.data
                if isinstance(t, dict) and 'customer_id' in t and t['customer_id'] in tier_users and t.get('points', 0) > 0
            ]
            avg_points = sum(t.get('points', 0) or 0 for t in tier_transactions if isinstance(t, dict)) / len(tier_users) if tier_users else 0
            engagement_by_tier.append({'tier': tier, 'avgPoints': round(avg_points, 2)})

        # Transactions by Type with Date Range Filter for Referrals
        referral_points = sum(
            r.get('reward_points', 0) or 0 for r in referrals_response.data
            if isinstance(r, dict) and 'date' in r and (dt := parse_iso_datetime(r['date'])) is not None
            and (start_date is None or dt >= start_date) and (end_date is None or dt <= end_date)
        )
        transactions_by_type = {
            'labels': ['Earned', 'Redeemed', 'Welcome', 'Referral'],
            'data': [
                sum(t.get('points', 0) or 0 for t in transactions_response.data if isinstance(t, dict) and t.get('type', '').lower() == 'earn_points' and t.get('points', 0) > 0),
                abs(sum(t.get('points', 0) or 0 for t in transactions_response.data if isinstance(t, dict) and t.get('type', '').lower() == 'redeem_points' and t.get('points', 0) < 0)),
                sum(t.get('points', 0) or 0 for t in transactions_response.data if isinstance(t, dict) and 'welcome_bonus' in t.get('type', '').lower() and t.get('points', 0) > 0),
                referral_points
            ]
        }

        # Compile charts data
        charts_data = {
            'transactionsByType': transactions_by_type,
            'customerSegments': {
                'labels': segment_labels,
                'data': segment_data,
                'colors': ['#34D399', '#EF4444', '#3B82F6', '#A855F7', '#F59E0B'][:len(segment_labels)]
            },
            'tierDistribution': {
                'labels': list(tier_counts.keys()),
                'data': list(tier_counts.values())
            },
            'pointsActivity': {
                'labels': months,
                'earned': earned,
                'redeemed': redeemed
            },
            'totalSalesOverTime': {
                'labels': months,
                'datasets': [
                    {
                        'label': 'Total Sales',
                        'data': [round(s, 2) for s in sales],
                        'backgroundColor': 'rgba(59, 130, 246, 0.8)',
                        'borderColor': 'rgb(59, 130, 246)',
                        'borderWidth': 1
                    }
                ]
            },
            'rewardPopularity': reward_popularity,
            'campaignEngagement': {
                'labels': [c['name'] for c in campaign_engagement],
                'data': [c['participants'] for c in campaign_engagement]
            },
            'campaignParticipationOverTime': {
                'labels': months,
                'datasets': participation_data
            },
            'customerEngagementByTier': {
                'labels': [e['tier'] for e in engagement_by_tier],
                'data': [e['avgPoints'] for e in engagement_by_tier]
            }
        }

        logger.info(f"Returning charts data: {charts_data}")
        return jsonify(charts_data)
    except Exception as e:
        logger.error(f"Charts error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500
# Staff: Customer Lookup
@app.route('/staff/customer-lookup', methods=['GET', 'OPTIONS'])
@require_auth
def customer_lookup():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        search = sanitize_input(request.args.get('search', ''))
        if not search:
            return jsonify({'error': 'Search term is required'}), 400

        user_query = supabase.table('users').select('id, name, email, phone, points_balance, tier, created_at, last_activity, points_earned')
        user_query = user_query.or_(f"email.ilike.%{search}%,phone.ilike.%{search}%").execute()
        
        if not user_query.data:
            logger.error(f"No customer found for search term: {search}")
            return jsonify({'error': 'Customer not found'}), 404

        customer = user_query.data[0]
        one_year_ago = (datetime.now(UTC) - timedelta(days=365)).isoformat()
        orders_response = supabase.table('orders').select('id, total, date').eq('customer_id', customer['id']).execute()
        
        total_spend = sum(order['total'] for order in orders_response.data)
        order_count = len(orders_response.data)
        avg_order_value = total_spend / order_count if order_count > 0 else 0
        
        last_purchase = max((parse_iso_datetime(order['date']) for order in orders_response.data), default=None)
        last_purchase = last_purchase.isoformat() if last_purchase else None
        
        transactions_response = supabase.table('transactions').select('points').eq('customer_id', customer['id']).execute()
        points_earned = customer['points_earned']
        points_redeemed = abs(sum(t['points'] for t in transactions_response.data if t['points'] < 0))
        
        ml_response = supabase.table('ml_predictions').select('clv_predicted').eq('customer_id', customer['id']).order('prediction_date', desc=True).limit(1).execute()
        churn_probability = ml_response.data[0]['clv_predicted'] * 0.1 if ml_response.data else 0.1
        
        rfm_response = supabase.table('orders').select('date, total').eq('customer_id', customer['id']).execute()
        rfm_data = rfm_response.data
        recency = (datetime.now(UTC) - max((parse_iso_datetime(order['date']) for order in rfm_data), default=datetime.now(UTC))).days
        frequency = len(rfm_data)
        monetary = sum(order['total'] for order in rfm_data)
        
        tier_progress = {
            'nextTier': 'Silver' if customer['tier'] == 'Bronze' else 'Gold' if customer['tier'] == 'Silver' else None,
            'pointsToNext': 1000 - customer['points_balance'] if customer['tier'] == 'Bronze' else 2000 - customer['points_balance'] if customer['tier'] == 'Silver' else 0,
            'progressPercentage': (customer['points_balance'] / 1000 * 100) if customer['tier'] == 'Bronze' else (customer['points_balance'] / 2000 * 100) if customer['tier'] == 'Silver' else 100
        }
        
        purchase_frequency = order_count / 12 if order_count > 0 else 0
        
        return jsonify({
            'id': customer['id'],
            'name': customer['name'],
            'email': customer['email'],
            'phone': customer['phone'],
            'points': customer['points_balance'],
            'tier': customer['tier'],
            'totalSpend': total_spend,
            'joinDate': customer['created_at'],
            'lastActivity': customer['last_activity'],
            'rfm': {
                'recency': recency,
                'frequency': frequency,
                'monetary': monetary
            },
            'churnProbability': churn_probability,
            'points_earned': points_earned,
            'points_redeemed': points_redeemed,
            'avgOrderValue': avg_order_value,
            'lastPurchaseDate': last_purchase,
            'purchaseFrequency': purchase_frequency,
            'tierProgress': tier_progress
        })
    except Exception as e:
        logger.error(f"Customer lookup error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Staff: Points Adjustment
@app.route('/staff/points-adjustment', methods=['POST', 'OPTIONS'])
@require_auth
def points_adjustment():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.json
        customer_id = sanitize_input(data.get('customer_id'))
        points = data.get('points')
        reason = sanitize_input(data.get('reason'))
        
        if not customer_id or not isinstance(points, (int, float)) or not reason:
            return jsonify({'error': 'Invalid input'}), 400
            
        user_response = supabase.table('users').select('points_balance').eq('id', customer_id).execute()
        if not user_response.data:
            return jsonify({'error': 'Customer not found'}), 404
            
        current_points = user_response.data[0]['points_balance']
        new_points = max(0, current_points + points)
        
        supabase.table('users').update({'points_balance': new_points}).eq('id', customer_id).execute()
        
        supabase.table('transactions').insert({
            'customer_id': customer_id,
            'points': points,
            'type': 'adjustment',
            'context': reason,
            'date': datetime.now(UTC).isoformat(),
            'amount': float(points) * 0.1  # Assuming amount is points * 0.1 for consistency
        }).execute()
        
        return jsonify({'customer': {'id': customer_id, 'points': new_points}})
    except Exception as e:
        logger.error(f"Points adjustment error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Staff: Redeem Reward
@app.route('/staff/redeem-reward', methods=['POST', 'OPTIONS'])
@require_auth
def redeem_reward():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        data = request.json
        customer_id = sanitize_input(data.get('customer_id'))
        reward_id = sanitize_input(data.get('reward_id'))
        
        if not customer_id or not reward_id:
            return jsonify({'error': 'Invalid input'}), 400
            
        user_response = supabase.table('users').select('points_balance').eq('id', customer_id).execute()
        reward_response = supabase.table('rewards').select('points_cost').eq('id', reward_id).execute()
        
        if not user_response.data or not reward_response.data:
            return jsonify({'error': 'Customer or reward not found'}), 404
            
        customer_points = user_response.data[0]['points_balance']
        reward_points = reward_response.data[0]['points_cost']
        
        if customer_points < reward_points:
            return jsonify({'error': 'Insufficient points'}), 400
            
        new_points = customer_points - reward_points
        supabase.table('users').update({'points_balance': new_points}).eq('id', customer_id).execute()
        
        supabase.table('transactions').insert({
            'customer_id': customer_id,
            'points': -reward_points,
            'type': 'redeem',
            'context': f"Redemption of reward {reward_id}",
            'date': datetime.now(UTC).isoformat(),
            'amount': float(-reward_points) * 0.1  # Assuming amount is points * 0.1 for consistency
        }).execute()
        
        return jsonify({'customer': {'id': customer_id, 'points': new_points}})
    except Exception as e:
        logger.error(f"Redeem reward error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Rewards
@app.route('/rewards', methods=['GET', 'OPTIONS'])
@require_auth
def get_rewards():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        rewards_response = supabase.table('rewards').select('id, name, points_cost').execute()
        if not rewards_response.data:
            return jsonify([]), 200

        transactions_response = supabase.table('transactions').select('context').eq('type', 'redeem').execute()
        reward_counts = {}
        for t in transactions_response.data:
            if not isinstance(t, dict) or 'context' not in t:
                continue
            try:
                reward_id = t['context'].split()[-1]
                reward_counts[reward_id] = reward_counts.get(reward_id, 0) + 1
            except Exception:
                continue

        rewards_data = [
            {
                'id': reward['id'],
                'name': reward['name'],
                'points': reward['points_cost'],
                'redemptionCount': reward_counts.get(reward['id'], 0)
            }
            for reward in rewards_response.data
            if isinstance(reward, dict) and all(key in reward for key in ['id', 'name', 'points_cost'])
        ]
        return jsonify(rewards_data), 200
    except Exception as e:
        logger.error(f"Rewards endpoint error: {str(e)}")
        return jsonify({'error': f"Failed to fetch rewards: {str(e)}"}), 500

# Dashboard: Top Rewards
@app.route('/dashboard/top-rewards', methods=['GET', 'OPTIONS'])
@require_auth
def top_rewards():
    if request.method == 'OPTIONS':
        return '', 204
    try:
        transactions_response = supabase.table('transactions').select('context').eq('type', 'redeem').execute()
        reward_counts = {}
        for t in transactions_response.data:
            reward_id = t['context'].split()[-1]
            reward_counts[reward_id] = reward_counts.get(reward_id, 0) + 1
            
        rewards_response = supabase.table('rewards').select('id, name, points_cost').execute()
        top_rewards = [
            {'name': r['name'], 'redemptions': reward_counts.get(r['id'], 0), 'points': r['points_cost']}
            for r in rewards_response.data
        ]
        top_rewards = sorted(top_rewards, key=lambda x: x['redemptions'], reverse=True)[:5]
        return jsonify(top_rewards)
    except Exception as e:
        logger.error(f"Top rewards error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Dashboard: Recommendations
@app.route('/dashboard/recommendations', methods=['GET', 'OPTIONS'])
@require_auth
def recommendations():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        users_response = supabase.table('users').select('id, name, tier').execute()
        logger.debug(f"Users query returned {len(users_response.data)} rows")
        
        orders_response = supabase.table('orders').select('customer_id, total').execute()
        ml_response = supabase.table('ml_predictions').select('id, customer_id, clv_predicted, prediction_date').execute()
        pred_rew_response = supabase.table('pred_rew').select('ml_prediction_id, reward_id, reason').execute()
        rewards_response = supabase.table('rewards').select('id, name').execute()
        
        customer_orders = {}
        for order in orders_response.data:
            if not isinstance(order, dict) or not all(key in order for key in ['customer_id', 'total']):
                logger.warning(f"Skipping invalid order record: {order}")
                continue
            customer_id = order['customer_id']
            if customer_id not in customer_orders:
                customer_orders[customer_id] = []
            customer_orders[customer_id].append(order)
        logger.debug(f"Orders fetched for {len(customer_orders)} customers")
        
        customer_ml = {}
        for ml in ml_response.data:
            if not isinstance(ml, dict) or not all(key in ml for key in ['id', 'customer_id', 'clv_predicted', 'prediction_date']):
                logger.warning(f"Skipping invalid ml_prediction record: {ml}")
                continue
            if ml['prediction_date'] is None:
                logger.warning(f"Skipping ml_prediction with null prediction_date for customer_id: {ml['customer_id']}")
                continue
            customer_id = ml['customer_id']
            if customer_id not in customer_ml:
                customer_ml[customer_id] = []
            customer_ml[customer_id].append(ml)
        logger.debug(f"ML predictions fetched for {len(customer_ml)} customers")
        
        reward_map = {r['id']: r['name'] for r in rewards_response.data}
        logger.debug(f"Rewards fetched: {len(reward_map)}")
        
        pred_rew_map = {}
        for pr in pred_rew_response.data:
            if not isinstance(pr, dict) or not all(key in pr for key in ['ml_prediction_id', 'reward_id']):
                logger.warning(f"Skipping invalid pred_rew record: {pr}")
                continue
            ml_prediction_id = pr['ml_prediction_id']
            reward_id = pr['reward_id']
            reward_name = reward_map.get(reward_id, 'None')
            reason = pr.get('reason', 'No reason provided')  # Use pred_rew.reason with fallback
            pred_rew_map[ml_prediction_id] = {'reward_name': reward_name, 'reason': reason}
        logger.debug(f"Pred_rew entries: {len(pred_rew_map)}")
        
        recommendations = []
        for user in users_response.data:
            if not isinstance(user, dict) or not all(key in user for key in ['id', 'name', 'tier']):
                logger.warning(f"Skipping invalid user record: {user}")
                continue
            customer_id = user['id']
            logger.debug(f"Processing user: {customer_id}")
            
            orders = customer_orders.get(customer_id, [])
            clv = sum(float(order['total']) for order in orders if isinstance(order, dict) and 'total' in order)
            
            ml_predictions = customer_ml.get(customer_id, [])
            predicted_clv = 0
            ml_prediction_id = None
            if ml_predictions:
                try:
                    latest_ml = max(
                        ml_predictions,
                        key=lambda x: parse_iso_datetime(x['prediction_date']) if parse_iso_datetime(x['prediction_date']) else datetime.min.replace(tzinfo=UTC)
                    )
                    predicted_clv = float(latest_ml.get('clv_predicted', 0)) if isinstance(latest_ml, dict) else 0
                    ml_prediction_id = latest_ml.get('id') if isinstance(latest_ml, dict) else None
                except Exception as e:
                    logger.warning(f"Error selecting latest ml_prediction for customer_id {customer_id}: {str(e)}")
                    predicted_clv = 0
                    ml_prediction_id = None
            
            pred_rew_data = pred_rew_map.get(ml_prediction_id, {'reward_name': 'None', 'reason': 'No reason provided'})
            recommended_reward = pred_rew_data['reward_name']
            reason = pred_rew_data['reason']
            
            recommendations.append({
                'customer': customer_id,
                'name': user['name'],
                'tier': user['tier'],
                'clv': f"${clv:.2f}",
                'predictedClv': f"${predicted_clv:.2f}",
                'recommendedReward': recommended_reward,
                'reason': reason
            })
        
        logger.debug(f"Returning {len(recommendations)} recommendations")
        return jsonify(recommendations)
    except Exception as e:
        logger.error(f"Recommendations error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

# Dashboard: Segments
@app.route('/dashboard/segments', methods=['GET', 'OPTIONS'])
@require_auth
def segments():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        segments_response = supabase.table('segments').select('id, name').execute()
        user_segments_response = supabase.table('user_segments').select('segment_id, customer_id').execute()
        transactions_response = supabase.table('transactions').select('customer_id, points, amount, date').execute()
        users_response = supabase.table('users').select('id, points_balance, tier').execute()

        segment_data = []
        for segment in segments_response.data:
            if not isinstance(segment, dict) or 'id' not in segment or 'name' not in segment:
                continue
            segment_id = segment['id']
            # Get customers in this segment
            customer_ids = [
                us['customer_id'] for us in user_segments_response.data
                if isinstance(us, dict) and us.get('segment_id') == segment_id
            ]
            count = len(customer_ids)
            # Calculate average spend and points
            segment_transactions = [
                t for t in transactions_response.data
                if isinstance(t, dict) and t.get('customer_id') in customer_ids and 'amount' in t
            ]
            total_spend = sum(t['amount'] for t in segment_transactions if isinstance(t, dict) and t.get('amount', 0) > 0)
            total_points = sum(u['points_balance'] for u in users_response.data if isinstance(u, dict) and u.get('id') in customer_ids and 'points_balance' in u)
            avg_spend = round(total_spend / count, 2) if count > 0 else 0
            avg_points = round(total_points / count, 2) if count > 0 else 0
            # Simulate retention rate (e.g., based on recent activity)
            active_customers = len([
                t for t in segment_transactions
                if isinstance(t, dict) and 'date' in t and (dt := parse_iso_datetime(t['date'])) is not None and
                dt >= datetime.now(UTC) - timedelta(days=90)
            ])
            retention_rate = round((active_customers / count * 100) if count > 0 else 50, 2)
            segment_data.append({
                'id': segment['id'],
                'name': segment['name'],
                'count': count,
                'description': f"{segment['name']} customers segment",
                'avgSpend': avg_spend,
                'avgPoints': avg_points,
                'retentionRate': retention_rate,
                'color': ''  # Color assigned in frontend
            })
        return jsonify(segment_data)
    except Exception as e:
        logger.error(f"Segments error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Catch-all route
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    return jsonify({'message': 'This is a SPA route.', 'path': path}), 200

