from flask import Flask, jsonify, request
from typing import List, Dict, Any
from datetime import datetime, timedelta
import pytz
import logging
import os
import uuid
import json
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import time
from functools import wraps
from dateutil.relativedelta import relativedelta
import random

# Initialize Flask app
app = Flask(__name__)
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s %(levelname)s: %(message)s')
logging.getLogger('supabase').setLevel(logging.WARNING)
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}}, methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"], allow_headers=["Content-Type", "X-User-ID"])

# Configuration
app.config['CACHE_TYPE'] = 'simple'

# Supabase connection with retry logic
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def create_supabase_client():
    max_retries = 3
    retry_delay = 2
    for attempt in range(max_retries):
        try:
            if not SUPABASE_URL or not SUPABASE_KEY:
                raise ValueError("SUPABASE_URL or SUPABASE_KEY not set in .env")
            client = create_client(SUPABASE_URL, SUPABASE_KEY)
            response = client.table('users').select('id').limit(1).execute()
            logger.info(f"Supabase connection successful, test query returned: {len(response.data)} rows")
            return client
        except Exception as e:
            logger.error(f"Supabase connection attempt {attempt + 1} failed: {str(e)}")
            if attempt < max_retries - 1:
                time.sleep(retry_delay)
            else:
                raise Exception(f"Failed to connect to Supabase after {max_retries} retries: {str(e)}")
try:
    supabase: Client = create_supabase_client()
except Exception as e:
    logger.critical(f"Failed to initialize Supabase client: {str(e)}")
    supabase = None

# Timezone configuration
UTC = pytz.UTC

# Authentication decorator (hardcoded for admin-1)
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method == 'OPTIONS':
            return jsonify({}), 204
        user_id = 'admin-1'
        logger.info(f"Using hardcoded user_id: {user_id} for request to {request.path}")
        return f(*args, **kwargs)
    return decorated

# Schema validation
def validate_schema():
    try:
        required_columns = {
            'transactions': ['date', 'points', 'customer_id', 'type', 'context'],
            'orders': ['date', 'total', 'customer_id'],
            'referrals': ['date', 'id'],
            'campaigns': ['start_date', 'id', 'name', 'type', 'rules', 'end_date', 'status'],
            'users': ['id', 'last_activity', 'tier', 'name', 'email', 'phone', 'created_at', 'points_balance', 'points_earned_last_12_months'],
            'rewards': ['id', 'name', 'points_cost'],
            'campaign_participants': ['id', 'campaign_id', 'customer_id', 'joined_at'],
            'ml_predictions': ['id', 'customer_id', 'clv_predicted', 'prediction_date'],
            'pred_rew': ['ml_prediction_id', 'reward_id']
        }
        schema_status = {}
        for table, columns in required_columns.items():
            schema_status[table] = {}
            for column in columns:
                try:
                    result = supabase.table(table).select(column).limit(1).execute()
                    schema_status[table][column] = f"Found, accessible"
                    logger.debug(f"Validated {table}.{column}: accessible")
                    if column in ('date', 'start_date', 'last_activity', 'joined_at', 'prediction_date'):
                        null_count_query = supabase.table(table).select('count').is_(column, None).execute()
                        null_count = null_count_query.data[0]['count'] if null_count_query.data else 0
                        schema_status[table][f"{column}_nulls"] = f"{null_count} null values"
                        logger.debug(f"{table}.{column} has {null_count} null values")
                except Exception as e:
                    schema_status[table][column] = f"Error: {str(e)}"
                    logger.error(f"Schema validation failed for {table}.{column}: {str(e)}")
        is_valid = all(
            'Error' not in status
            for table, cols in schema_status.items()
            for column, status in cols.items() if not column.endswith('_nulls')
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

# Parse ISO datetime with timezone
def parse_iso_datetime(date_str):
    try:
        dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        if dt.tzinfo is None:
            return dt.replace(tzinfo=UTC)
        return dt
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
        logger.error(f"Health check failed: {str(e)}", exc_info=True)
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
        logger.error(f"Login error: {str(e)}", exc_info=True)
        return jsonify({'error': 'Admin table not available, use demo credentials'}), 503

# Dashboard: KPIs
@app.route('/dashboard/kpis', methods=['GET', 'OPTIONS'])
@require_auth
def kpis():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        users_response = supabase.table('users').select('points_balance, points_earned_last_12_months, tier').execute()
        orders_response = supabase.table('orders').select('total, date, customer_id').execute()
        transactions_response = supabase.table('transactions').select('points, type').execute()
        ml_response = supabase.table('ml_predictions').select('clv_predicted').execute()

        total_customers = len(users_response.data)
        total_points = sum(user['points_balance'] for user in users_response.data)
        avg_points = total_points / total_customers if total_customers > 0 else 0
        total_spend = sum(order['total'] for order in orders_response.data)
        order_count = len(orders_response.data)
        avg_order_value = total_spend / order_count if order_count > 0 else 0
        points_earned = sum(user['points_earned_last_12_months'] for user in users_response.data)
        points_redeemed = abs(sum(t['points'] for t in transactions_response.data if t['points'] < 0))
        avg_clv = sum(ml['clv_predicted'] for ml in ml_response.data) / len(ml_response.data) if ml_response.data else 0

        thirty_days_ago = datetime.now(UTC) - timedelta(days=30)
        active_customers = len(set(
            order['customer_id'] for order in orders_response.data
            if parse_iso_datetime(order['date']) > thirty_days_ago
        ))
        retention_rate = (active_customers / total_customers * 100) if total_customers > 0 else 0

        kpis_data = [
            {
                'title': 'Total Customers',
                'value': total_customers,
                'change': '+5.2% from last month',
                'trend': 'up',
                'icon': 'Users',
                'color': 'blue'
            },
            {
                'title': 'Average Points Balance',
                'value': round(avg_points, 2),
                'change': '+3.1% from last month',
                'trend': 'up',
                'icon': 'Gift',
                'color': 'green'
            },
            {
                'title': 'Average Order Value',
                'value': f"${round(avg_order_value, 2)}",
                'change': '-1.5% from last month',
                'trend': 'down',
                'icon': 'DollarSign',
                'color': 'yellow'
            },
            {
                'title': 'Points Earned',
                'value': points_earned,
                'change': '+8.7% from last month',
                'trend': 'up',
                'icon': 'TrendingUp',
                'color': 'cyan'
            },
            {
                'title': 'Points Redeemed',
                'value': points_redeemed,
                'change': '+6.4% from last month',
                'trend': 'up',
                'icon': 'Award',
                'color': 'purple'
            },
            {
                'title': 'Retention Rate',
                'value': f"{round(retention_rate, 2)}%",
                'change': '+2.3% from last month',
                'trend': 'up',
                'icon': 'Percent',
                'color': 'teal'
            },
            {
                'title': 'Average CLV',
                'value': f"${round(avg_clv, 2)}",
                'change': '-0.8% from last month',
                'trend': 'down',
                'icon': 'DollarSign',
                'color': 'orange'
            },
            {
                'title': 'Active Campaigns',
                'value': len(supabase.table('campaigns').select('id').eq('status', 'active').execute().data),
                'change': '+1 from last month',
                'trend': 'up',
                'icon': 'Megaphone',
                'color': 'blue'
            }
        ]
        return jsonify(kpis_data)
    except Exception as e:
        logger.error(f"KPIs error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

# Campaigns
@app.route('/campaigns', methods=['GET', 'OPTIONS'])
@require_auth
def campaigns():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        campaigns_response = supabase.table('campaigns').select('id, name, type, status, start_date, end_date, rules, campaign_participants(count)').execute()
        campaigns_data = []
        for campaign in campaigns_response.data:
            participants = campaign.get('campaign_participants', [{}])[0].get('count', 0)
            transactions_response = supabase.table('transactions').select('points').eq('context', f"Campaign {campaign['id']}").execute()
            points_issued = sum(t['points'] for t in transactions_response.data if t['points'] > 0)
            revenue = sum(t['points'] * 0.1 for t in transactions_response.data if t['points'] > 0)
            campaigns_data.append({
                'id': campaign['id'],
                'name': campaign['name'],
                'type': campaign['type'],
                'status': campaign['status'],
                'startDate': campaign['start_date'],
                'endDate': campaign['end_date'],
                'rules': campaign['rules'],
                'participants': participants,
                'pointsIssued': points_issued,
                'revenue': round(revenue, 2)
            })
        return jsonify(campaigns_data)
    except Exception as e:
        logger.error(f"Campaigns error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

# Promotions (Placeholder)
@app.route('/promotions', methods=['GET', 'OPTIONS'])
@require_auth
def promotions():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        promotions_data = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Summer Sale',
                'type': 'discount',
                'status': 'active',
                'startDate': datetime.now(UTC).isoformat(),
                'endDate': (datetime.now(UTC) + timedelta(days=30)).isoformat(),
                'description': '10% off for all customers'
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Loyalty Bonus',
                'type': 'points',
                'status': 'planned',
                'startDate': (datetime.now(UTC) + timedelta(days=10)).isoformat(),
                'endDate': (datetime.now(UTC) + timedelta(days=40)).isoformat(),
                'description': 'Double points for Gold tier'
            }
        ]
        return jsonify(promotions_data)
    except Exception as e:
        logger.error(f"Promotions error: {str(e)}", exc_info=True)
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
        
        query = supabase.table('transactions').select('id, customer_id, points, type, context, date')
        if search:
            query = query.ilike('customer_id', f'%{search}%')
        if type_filter != 'all':
            query = query.eq('type', type_filter)
        if date_range:
            start_date = (datetime.now(UTC) - timedelta(days=date_range)).isoformat()
            query = query.gte('date', start_date)
        
        transactions_response = query.execute()
        logger.debug(f"Transactions query returned {len(transactions_response.data)} rows")
        
        users_response = supabase.table('users').select('id, name').execute()
        user_map = {user['id']: user['name'] for user in users_response.data}
        logger.debug(f"Fetched {len(user_map)} users for name mapping")
        
        transactions_data = []
        total_points = 0
        total_value = 0
        flagged_transactions = 0
        
        for t in transactions_response.data:
            if not isinstance(t, dict) or not all(key in t for key in ['id', 'customer_id', 'points', 'type', 'context', 'date']):
                logger.warning(f"Skipping transaction with missing fields: {t}")
                continue
            customer_name = user_map.get(t['customer_id'], 'Unknown')
            status = 'completed' if t['points'] != 0 else 'pending'
            amount = t['points'] * 0.1  # Assuming 1 point = $0.1 as in the original logic
            # Simple heuristic for flagging suspicious transactions (e.g., high points)
            flagged = abs(t['points']) > 1000  # Flag if points are unusually high (positive or negative)
            if flagged:
                flagged_transactions += 1
            total_points += t['points']
            total_value += amount
            transactions_data.append({
                'id': t['id'],
                'customerId': t['customer_id'],
                'customerName': customer_name,
                'type': t['type'],
                'points': t['points'],
                'amount': amount,
                'description': t['context'],
                'date': t['date'],
                'status': status,
                'flagged': flagged
            })
        
        stats = {
            'totalTransactions': len(transactions_data),
            'totalPoints': total_points,
            'totalValue': round(total_value, 2),
            'flaggedTransactions': flagged_transactions
        }
        
        logger.debug(f"Returning {len(transactions_data)} transactions with stats: {stats}")
        return jsonify({'transactions': transactions_data, 'stats': stats}), 200
    except Exception as e:
        logger.error(f"Transactions error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/dashboard/customers', methods=['GET', 'OPTIONS'])
@require_auth
def customers():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    logger.info(f"Processing GET /dashboard/customers at {datetime.now(UTC).isoformat()} with headers: {request.headers}")
    try:
        # Check Supabase client
        if supabase is None:
            logger.error("Supabase client not available")
            return jsonify({'error': 'Service unavailable, please retry'}), 503

        # Fetch users data
        logger.debug("Fetching users data")
        users_response = supabase.table('users').select('id, name, email, tier, points_balance, last_activity, created_at').execute()
        if not users_response.data:
            logger.warning("No user data available")
            return jsonify({'error': 'No user data available'}), 404
        logger.debug(f"Fetched {len(users_response.data)} users")

        # Fetch orders data
        logger.debug("Fetching orders data")
        orders_response = supabase.table('orders').select('customer_id, total, date').execute()
        customer_orders = {}
        for order in orders_response.data:
            if not isinstance(order, dict) or not all(key in order for key in ['customer_id', 'total', 'date']):
                logger.warning(f"Skipping invalid order record: {order}")
                continue
            customer_id = order['customer_id']
            if customer_id not in customer_orders:
                customer_orders[customer_id] = []
            customer_orders[customer_id].append(order)
        logger.debug(f"Processed orders for {len(customer_orders)} customers")

        # Fetch ML predictions
        logger.debug("Fetching ML predictions")
        ml_response = supabase.table('ml_predictions').select('customer_id, clv_predicted').execute()
        customer_clv = {ml['customer_id']: ml['clv_predicted'] for ml in ml_response.data if isinstance(ml, dict) and all(key in ml for key in ['customer_id', 'clv_predicted'])}
        logger.debug(f"Mapped CLV for {len(customer_clv)} customers")

        # Generate segment mapping (adapted from /dashboard/segments)
        logger.debug("Generating segment mapping")
        segments = [
            {'name': 'High Value', 'customers': []},
            {'name': 'At Risk', 'customers': []},
            {'name': 'New', 'customers': []},
            {'name': 'Loyal', 'customers': []}
        ]
        one_year_ago = datetime.now(UTC) - timedelta(days=365)
        ninety_days_ago = datetime.now(UTC) - timedelta(days=90)

        for user in users_response.data:
            if not isinstance(user, dict) or not all(key in user for key in ['id', 'name', 'tier', 'points_balance', 'created_at']):
                logger.warning(f"Skipping invalid user record: {user}")
                continue
            customer_id = user['id']
            orders = customer_orders.get(customer_id, [])
            total_spend = sum(order['total'] for order in orders if isinstance(order, dict) and 'total' in order)
            clv = customer_clv.get(customer_id, 0)
            points = user['points_balance']
            last_order = None
            if orders:
                valid_dates = [parse_iso_datetime(order['date']) for order in orders if parse_iso_datetime(order['date'])]
                last_order = max(valid_dates) if valid_dates else None
            created_at = parse_iso_datetime(user['created_at'])
            if not created_at:
                logger.warning(f"Skipping user {customer_id} with invalid created_at: {user['created_at']}")
                continue

            # Assign customer to a segment
            if clv > 1000 or points > 2000:
                segments[0]['customers'].append(user)
            elif last_order and last_order < ninety_days_ago:
                segments[1]['customers'].append(user)
            elif created_at > one_year_ago:
                segments[2]['customers'].append(user)
            elif len(orders) > 5 and clv > 500:
                segments[3]['customers'].append(user)

        # Create segment map
        segment_map = {}
        for segment in segments:
            for customer in segment['customers']:
                if isinstance(customer, dict) and 'id' in customer:
                    segment_map[customer['id']] = segment['name']
        logger.debug(f"Mapped {len(segment_map)} customers to segments")

        # Process customer data
        customers_data = []
        for user in users_response.data:
            logger.debug(f"Processing user {user.get('id', 'unknown')}")
            if not isinstance(user, dict) or not all(key in user for key in ['id', 'name', 'email', 'tier', 'points_balance', 'last_activity']):
                logger.warning(f"Skipping invalid user record: {user}")
                continue

            customer_id = user['id']
            orders = customer_orders.get(customer_id, [])
            total_spend = sum(order['total'] for order in orders if isinstance(order, dict) and 'total' in order) or 0
            valid_dates = [parse_iso_datetime(order['date']) for order in orders if parse_iso_datetime(order['date'])]
            last_activity = max(valid_dates, default=parse_iso_datetime(user['last_activity']) or datetime.now(UTC))
            last_activity = last_activity.isoformat()
            churn_risk = customer_clv.get(customer_id, 0) * 0.1 if customer_clv.get(customer_id) else 0.1
            segment = segment_map.get(customer_id, 'Unassigned')

            customers_data.append({
                'id': customer_id,
                'name': user['name'],
                'email': user['email'],
                'tier': user['tier'],
                'points': user['points_balance'],
                'spend': total_spend,
                'lastActivity': last_activity,
                'segment': segment,
                'churnRisk': round(churn_risk * 100, 2)
            })

        logger.debug(f"Returning {len(customers_data)} customers")
        return jsonify(customers_data)
    except Exception as e:
        logger.error(f"Customers error at {datetime.now(UTC).isoformat()}: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error'}), 500

# Dashboard: Charts


    

@app.route('/dashboard/charts/', methods=['GET', 'OPTIONS'])

@require_auth

def charts():

    if request.method == 'OPTIONS':

        return jsonify({}), 204
 
    try:

        # Fetch data from Supabase

        transactions_response = supabase.table('transactions').select('points, type, date, context').execute()

        users_response = supabase.table('users').select('tier, points_balance, id').execute()

        campaigns_response = supabase.table('campaigns').select('id, name').execute()

        campaign_participants_response = supabase.table('campaign_participants').select('campaign_id, joined_at').execute()
 
        logger.debug(f"Transactions query returned {len(transactions_response.data)} rows")

        logger.debug(f"Users query returned {len(users_response.data)} rows")

        logger.debug(f"Campaigns query returned {len(campaigns_response.data)} rows")

        logger.debug(f"Campaign participants query returned {len(campaign_participants_response.data)} rows")
 
        months = [(datetime.now(UTC) - relativedelta(months=i)).strftime('%b %Y') for i in range(11, -1, -1)]
 
        earned = []

        redeemed = []

        for month in months:

            month_start = datetime.strptime(month, '%b %Y').replace(day=1, tzinfo=UTC)

            month_end = month_start + relativedelta(months=1) - timedelta(seconds=1)
 
            month_transactions = [

                t for t in transactions_response.data

                if (

                    isinstance(t, dict) and

                    'date' in t and

                    (dt := parse_iso_datetime(t['date'])) is not None and

                    month_start <= dt <= month_end

                )

            ]
 
            earned.append(sum(t['points'] for t in month_transactions if isinstance(t, dict) and 'points' in t and t['points'] > 0))

            redeemed.append(abs(sum(t['points'] for t in month_transactions if isinstance(t, dict) and 'points' in t and t['points'] < 0)))
 
        # Count tiers using hard-coded tiers dictionary

        tier_counts = {'Bronze': 0, 'Silver': 0, 'Gold': 0}

        for user in users_response.data:

            if not isinstance(user, dict) or 'tier' not in user:

                logger.warning(f"Skipping invalid user record: {user}")

                continue

            tier = user['tier']

            if tier in tier_counts:

                tier_counts[tier] += 1
 
        # Calculate customer segments for charts (distinct tiers and counts)

        all_tiers = [u['tier'] for u in users_response.data if isinstance(u, dict) and 'tier' in u]

        distinct_tiers = list(set(all_tiers))
 
        segment_labels = distinct_tiers

        segment_data = []
 
        for tier in distinct_tiers:

            count = sum(1 for u in users_response.data if isinstance(u, dict) and u.get('tier') == tier)

            segment_data.append(count)
 
        # Reward popularity calculation

        rewards_response = supabase.table('rewards').select('id, name').execute()

        reward_counts = {}

        for t in transactions_response.data:

            if not isinstance(t, dict) or not all(key in t for key in ['type', 'context']):

                logger.warning(f"Skipping invalid transaction record: {t}")

                continue

            if t['type'] == 'redeem' and t['context']:

                try:

                    reward_id = t['context'].split()[-1]

                    reward_counts[reward_id] = reward_counts.get(reward_id, 0) + 1

                except Exception as e:

                    logger.warning(f"Error parsing reward_id from context '{t['context']}': {str(e)}")

                    continue
 
        reward_popularity = [

            {'name': r['name'], 'score': reward_counts.get(r['id'], 0)}

            for r in rewards_response.data if isinstance(r, dict) and 'id' in r and 'name' in r

        ]
 
        # Campaign engagement calculation

        campaign_engagement = []

        for campaign in campaigns_response.data:

            if not isinstance(campaign, dict) or 'id' not in campaign or 'name' not in campaign:

                logger.warning(f"Skipping invalid campaign record: {campaign}")

                continue

            participants = len([p for p in campaign_participants_response.data if isinstance(p, dict) and 'campaign_id' in p and p['campaign_id'] == campaign['id']])

            campaign_engagement.append({'name': campaign['name'], 'participants': participants})
 
        # Campaign participation over time

        participation_data = []

        for campaign in campaigns_response.data:

            if not isinstance(campaign, dict) or 'id' not in campaign or 'name' not in campaign:

                continue
 
            monthly_counts = []

            for month in months:

                month_start = datetime.strptime(month, '%b %Y').replace(day=1, tzinfo=UTC)

                month_end = month_start + relativedelta(months=1) - timedelta(seconds=1)
 
                count = len([

                    p for p in campaign_participants_response.data

                    if (

                        isinstance(p, dict) and

                        'campaign_id' in p and

                        'joined_at' in p and

                        p['campaign_id'] == campaign['id'] and

                        (join_date := parse_iso_datetime(p['joined_at'])) is not None and

                        month_start <= join_date <= month_end

                    )

                ])

                monthly_counts.append(count)
 
            participation_data.append({

                'label': campaign['name'],

                'data': monthly_counts,

                'backgroundColor': f'rgba({random.randint(0, 255)}, {random.randint(0, 255)}, {random.randint(0, 255)}, 0.5)',

                'borderColor': f'rgb({random.randint(0, 255)}, {random.randint(0, 255)}, {random.randint(0, 255)})',

                'borderWidth': 1

            })
 
        # Customer engagement by tier

        engagement_by_tier = []

        for tier in ['Bronze', 'Silver', 'Gold']:

            tier_users = [u['id'] for u in users_response.data if isinstance(u, dict) and u.get('tier') == tier and 'id' in u]

            tier_transactions = [t for t in transactions_response.data if isinstance(t, dict) and 'customer_id' in t and t['customer_id'] in tier_users and t['points'] > 0]

            avg_points = sum(t['points'] for t in tier_transactions if isinstance(t, dict) and 'points' in t) / len(tier_users) if tier_users else 0

            engagement_by_tier.append({'tier': tier, 'avgPoints': round(avg_points, 2)})
 
        charts_data = {

            'transactionsByType': {

                'labels': ['Birthday', 'Earn', 'Referral', 'Redeem', 'Welcome'],

                'data': [

                    sum(t['points'] for t in transactions_response.data if isinstance(t, dict) and 'type' in t and t['type'].lower() == 'birthday'),

                    sum(t['points'] for t in transactions_response.data if isinstance(t, dict) and 'type' in t and t['type'].lower() == 'earn' and t['points'] > 0),

                    sum(t['points'] for t in transactions_response.data if isinstance(t, dict) and 'type' in t and t['type'].lower() == 'referral'),

                    abs(sum(t['points'] for t in transactions_response.data if isinstance(t, dict) and 'type' in t and t['type'].lower() == 'redeem' and t['points'] < 0)),

                    sum(t['points'] for t in transactions_response.data if isinstance(t, dict) and 'type' in t and t['type'].lower() == 'welcome')

                ]

            },

            'customerSegments': {

                'labels': segment_labels,

                'data': segment_data,

                'colors': ['#34D399', '#EF4444', '#3B82F6'][:len(segment_labels)]

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
 
        logger.debug(f"Returning charts data with {len(charts_data)} keys")
 
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

        user_query = supabase.table('users').select('id, name, email, phone, points_balance, tier, created_at, last_activity, points_earned_last_12_months')
        user_query = user_query.or_(f"email.ilike.%{search}%,phone.ilike.%{search}%").execute()
        
        if not user_query.data:
            logger.error(f"No customer found for search term: {search}")
            return jsonify({'error': 'Customer not found'}), 404

        customer = user_query.data[0]
        
        one_year_ago = (datetime.now(UTC) - timedelta(days=365)).isoformat()
        orders_response = supabase.table('orders').select('id, total, date').eq('customer_id', customer['id']).gte('date', one_year_ago).execute()
        
        total_spend = sum(order['total'] for order in orders_response.data)
        order_count = len(orders_response.data)
        avg_order_value = total_spend / order_count if order_count > 0 else 0
        
        last_purchase = max((parse_iso_datetime(order['date']) for order in orders_response.data), default=None)
        last_purchase = last_purchase.isoformat() if last_purchase else None
        
        transactions_response = supabase.table('transactions').select('points').eq('customer_id', customer['id']).execute()
        points_earned = customer['points_earned_last_12_months']
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
        logger.error(f"Customer lookup error: {str(e)}", exc_info=True)
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
        
        if not customer_id or not isinstance(points, int) or not reason:
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
            'date': datetime.now(UTC).isoformat()
        }).execute()
        
        return jsonify({'customer': {'id': customer_id, 'points': new_points}})
    except Exception as e:
        logger.error(f"Points adjustment error: {str(e)}", exc_info=True)
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
            'date': datetime.now(UTC).isoformat()
        }).execute()
        
        return jsonify({'customer': {'id': customer_id, 'points': new_points}})
    except Exception as e:
        logger.error(f"Redeem reward error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/rewards', methods=['GET', 'OPTIONS'])
@require_auth
def get_rewards():
    if request.method == 'OPTIONS':
        return jsonify({}), 204
    try:
        # Fetch all rewards from Supabase
        rewards_response = supabase.table('rewards').select('id, name, points_cost').execute()
        if not rewards_response.data:
            logger.warning("No rewards found in the database")
            return jsonify([]), 200

        # Fetch redemption transactions to calculate redemptionCount
        transactions_response = supabase.table('transactions').select('context').eq('type', 'redeem').execute()
        reward_counts = {}
        for t in transactions_response.data:
            if not isinstance(t, dict) or 'context' not in t:
                logger.warning(f"Skipping invalid transaction record: {t}")
                continue
            try:
                reward_id = t['context'].split()[-1]  # Assumes context format like "Redemption of reward {reward_id}"
                reward_counts[reward_id] = reward_counts.get(reward_id, 0) + 1
            except Exception as e:
                logger.warning(f"Error parsing reward_id from context '{t['context']}': {str(e)}")
                continue

        # Format rewards to match the expected Reward interface
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

        logger.debug(f"Returning {len(rewards_data)} rewards")
        return jsonify(rewards_data), 200
    except Exception as e:
        logger.error(f"Rewards endpoint error: {str(e)}", exc_info=True)
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
        logger.error(f"Top rewards error: {str(e)}", exc_info=True)
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
        pred_rew_response = supabase.table('pred_rew').select('ml_prediction_id, reward_id').execute()
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
            pred_rew_map[ml_prediction_id] = reward_name
        logger.debug(f"Pred_rew entries: {len(pred_rew_map)}")
        
        recommendations = []
        for user in users_response.data:
            if not isinstance(user, dict) or not all(key in user for key in ['id', 'name', 'tier']):
                logger.warning(f"Skipping invalid user record: {user}")
                continue
            customer_id = user['id']
            logger.debug(f"Processing user: {customer_id}")
            
            orders = customer_orders.get(customer_id, [])
            clv = sum(order['total'] for order in orders if isinstance(order, dict) and 'total' in order)
            
            ml_predictions = customer_ml.get(customer_id, [])
            predicted_clv = 0
            ml_prediction_id = None
            if ml_predictions:
                try:
                    latest_ml = max(
                        ml_predictions,
                        key=lambda x: parse_iso_datetime(x['prediction_date']) if parse_iso_datetime(x['prediction_date']) else datetime.min.replace(tzinfo=UTC)
                    )
                    predicted_clv = latest_ml.get('clv_predicted', 0) if isinstance(latest_ml, dict) else 0
                    ml_prediction_id = latest_ml.get('id') if isinstance(latest_ml, dict) else None
                except Exception as e:
                    logger.warning(f"Error selecting latest ml_prediction for customer_id {customer_id}: {str(e)}")
                    predicted_clv = 0
                    ml_prediction_id = None
            
            recommended_reward = pred_rew_map.get(ml_prediction_id, 'None') if ml_prediction_id else 'None'
            
            reason = (
                f"Recommended based on {user['tier']} tier status and "
                f"{'high' if clv > 1000 else 'moderate'} purchase history"
            )
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
        users_response = supabase.table('users').select('id, name, tier, points_balance, created_at').execute()
        orders_response = supabase.table('orders').select('customer_id, total, date').execute()
        ml_response = supabase.table('ml_predictions').select('customer_id, clv_predicted').execute()

        logger.debug(f"Users query returned {len(users_response.data)} rows")
        logger.debug(f"Orders query returned {len(orders_response.data)} rows")
        logger.debug(f"ML predictions query returned {len(ml_response.data)} rows")

        # Initialize customer_orders as a dictionary
        customer_orders_dict = {}
        for order in orders_response.data:
            if not isinstance(order, dict) or not all(key in order for key in ['customer_id', 'total', 'date']):
                logger.warning(f"Skipping invalid order record: {order}")
                continue
            customer_id = order['customer_id']
            if customer_id not in customer_orders_dict:
                customer_orders_dict[customer_id] = []
            customer_orders_dict[customer_id].append(order)
        logger.debug(f"Orders mapped for {len(customer_orders_dict)} customers")

        customer_clv = {}
        for ml in ml_response.data:
            if not isinstance(ml, dict) or not all(key in ml for key in ['customer_id', 'clv_predicted']):
                logger.warning(f"Skipping invalid ml_prediction record: {ml}")
                continue
            customer_id = ml['customer_id']
            customer_clv[customer_id] = ml['clv_predicted']
        logger.debug(f"CLV mapped for {len(customer_clv)} customers")

        segments = [
            {'id': str(uuid.uuid4()), 'name': 'High Value', 'description': 'Customers with high CLV or points balance', 'color': 'green', 'customers': []},
            {'id': str(uuid.uuid4()), 'name': 'At Risk', 'description': 'Customers with low recent activity', 'color': 'red', 'customers': []},
            {'id': str(uuid.uuid4()), 'name': 'New', 'description': 'Recently joined customers', 'color': 'blue', 'customers': []},
            {'id': str(uuid.uuid4()), 'name': 'Loyal', 'description': 'Frequent buyers with moderate CLV', 'color': 'purple', 'customers': []}
        ]

        one_year_ago = datetime.now(UTC) - timedelta(days=365)
        ninety_days_ago = datetime.now(UTC) - timedelta(days=90)

        for user in users_response.data:
            if not isinstance(user, dict) or not all(key in user for key in ['id', 'name', 'tier', 'points_balance', 'created_at']):
                logger.warning(f"Skipping invalid user record: {user}")
                continue
            customer_id = user['id']
            orders = customer_orders_dict.get(customer_id, [])
            total_spend = sum(order['total'] for order in orders if isinstance(order, dict) and 'total' in order)
            clv = customer_clv.get(customer_id, 0)
            points = user['points_balance']
            last_order = None
            if orders:
                valid_dates = [parse_iso_datetime(order['date']) for order in orders if parse_iso_datetime(order['date'])]
                last_order = max(valid_dates) if valid_dates else None

            created_at = parse_iso_datetime(user['created_at'])
            if not created_at:
                logger.warning(f"Skipping user {customer_id} with invalid created_at: {user['created_at']}")
                continue

            if clv > 1000 or points > 2000:
                segments[0]['customers'].append(user)
            elif last_order and last_order < ninety_days_ago:
                segments[1]['customers'].append(user)
            elif created_at > one_year_ago:
                segments[2]['customers'].append(user)
            elif len(orders) > 5 and clv > 500:
                segments[3]['customers'].append(user)

        segment_data = []
        logger.debug(f"Type of customer_orders_dict: {type(customer_orders_dict)}")
        for segment in segments:
            customers = segment['customers']
            count = len(customers)
            if count == 0:
                continue

            total_spend = 0
            total_points = 0
            active_customers = 0
            for customer in customers:
                if not isinstance(customer, dict) or not all(key in customer for key in ['id', 'points_balance']):
                    logger.warning(f"Skipping invalid customer in segment {segment['name']}: {customer}")
                    continue
                customer_id = customer['id']
                logger.debug(f"Processing customer in segment {segment['name']}: {customer_id}")
                if not isinstance(customer_orders_dict, dict):
                    logger.error(f"customer_orders_dict is not a dictionary: {type(customer_orders_dict)}")
                    raise ValueError("customer_orders_dict is not a dictionary")
                orders_for_customer = customer_orders_dict.get(customer_id, [])
                total_spend += sum(order['total'] for order in orders_for_customer if isinstance(order, dict) and 'total' in order)
                total_points += customer['points_balance']
                valid_dates = [parse_iso_datetime(order['date']) for order in orders_for_customer if parse_iso_datetime(order['date'])]
                last_order = max(valid_dates) if valid_dates else None
                if last_order and last_order > ninety_days_ago:
                    active_customers += 1

            avg_spend = total_spend / count if count > 0 else 0
            avg_points = total_points / count if count > 0 else 0
            retention_rate = (active_customers / count * 100) if count > 0 else 0

            segment_data.append({
                'id': segment['id'],
                'name': segment['name'],
                'count': count,
                'description': segment['description'],
                'avgSpend': round(avg_spend, 2),
                'avgPoints': round(avg_points, 2),
                'retentionRate': round(retention_rate, 2),
                'color': segment['color']
            })

        logger.debug(f"Returning {len(segment_data)} segments")
        return jsonify(segment_data)
    except Exception as e:
        logger.error(f"Segments error: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)