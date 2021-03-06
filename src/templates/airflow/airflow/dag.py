from utils.slack_fallback import on_failure_slack_callback
from airflow.operators import GHKubernetesPodOperator
from airflow.contrib.kubernetes.secret import Secret
from datetime import datetime, timedelta
from airflow import DAG
from re import search
from os import path

# Don't change
filename = path.splitext(path.basename(__file__))[0]
dag_id = '__NAME__-' + filename
author = '__AUTHOR__'
author_email = search('<(.*)>', author).group(1)

default_args = {
    'on_failure_callback': on_failure_slack_callback(dag_id, '#dev_hotline'),
    'description': '{{dagDescription}}',
    'retry_delay': timedelta(minutes=1),
    'start_date': datetime({{year}}, {{month}}, {{day}}),
    'email_on_failure': True,
    'email_on_retry': False,
    'email': [author_email],
    'owner': author,
    'retries': 1,
}

dag = DAG(
    schedule_interval='{{dagInterval}}',
    default_args=default_args,
    catchup=False,
    dag_id=dag_id,
)

k = GHKubernetesPodOperator(
    secrets=[Secret('env', None, '__SECRETS__')],
    labels={'app': 'airflow', 'dag': dag_id, 'tier': '__NAME__'},
    service_account_name={{serviceAccountDag}},
    arguments=['start:' + filename],
    image='__DOCKER_IMAGE__',
    task_id=dag_id,
    cmds=['yarn'],
    name=dag_id,
    dag=dag,
)
