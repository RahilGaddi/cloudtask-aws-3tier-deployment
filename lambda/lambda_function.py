"""
CloudTask - Daily CloudWatch Logs Archival Lambda

Purpose:
    Export the previous complete day's CloudWatch Logs
    from the shared EC2 log group to Amazon S3 for archival
    and further analysis with Amazon Athena.

Architecture:
    Frontend EC2
          |
    Backend EC2
          |
    CloudWatch Agent
          |
    CloudWatch Logs
          |
    Log Group: ec2-all-logs
          |
    Lambda: Daily-log
          |
    Amazon S3: cloudtaskmyproject
          |
    Amazon Athena

Region:
    eu-north-1

Runtime:
    Python / boto3

Authentication:
    Uses the Lambda execution role.
    No AWS access keys or credentials are stored in this code.
"""

import os
from datetime import datetime, timedelta, timezone

import boto3
from botocore.exceptions import ClientError


logs_client = boto3.client("logs")


LOG_GROUP_NAME = os.environ.get(
    "LOG_GROUP_NAME",
    "ec2-all-logs"
)

S3_BUCKET = os.environ.get(
    "S3_BUCKET",
    "cloudtaskmyproject"
)

S3_PREFIX = os.environ.get(
    "S3_PREFIX",
    "cloudwatch-logs"
)


def lambda_handler(event, context):
    """
    Create a CloudWatch Logs export task for the
    previous complete UTC day.

    CloudWatch Logs performs the actual export
    to S3 asynchronously.
    """

    now = datetime.now(timezone.utc)

    # Start of the current UTC day
    end_time = now.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0
    )

    # Previous complete UTC day
    start_time = end_time - timedelta(days=1)

    destination_prefix = (
        f"{S3_PREFIX}/"
        f"{start_time.strftime('%Y/%m/%d')}"
    )

    print("========================================")
    print("CloudTask Daily Log Archival")
    print("========================================")
    print(f"Log Group : {LOG_GROUP_NAME}")
    print(f"S3 Bucket : {S3_BUCKET}")
    print(f"S3 Prefix : {destination_prefix}")
    print(f"Start UTC : {start_time.isoformat()}")
    print(f"End UTC   : {end_time.isoformat()}")

    try:
        response = logs_client.create_export_task(
            logGroupName=LOG_GROUP_NAME,
            fromTime=int(start_time.timestamp() * 1000),
            to=int(end_time.timestamp() * 1000),
            destination=S3_BUCKET,
            destinationPrefix=destination_prefix
        )

        task_id = response["taskId"]

        print(
            f"Export task created successfully: {task_id}"
        )

        return {
            "statusCode": 200,
            "message": (
                "CloudWatch log export task "
                "created successfully"
            ),
            "log_group": LOG_GROUP_NAME,
            "s3_bucket": S3_BUCKET,
            "s3_prefix": destination_prefix,
            "task_id": task_id,
            "export_date": start_time.strftime("%Y-%m-%d")
        }

    except logs_client.exceptions.LimitExceededException:
        print(
            "CloudWatch Logs export limit reached. "
            "Another export task may already be running."
        )

        return {
            "statusCode": 429,
            "message": (
                "CloudWatch Logs export limit reached. "
                "Another export task may already be running."
            )
        }

    except ClientError as error:
        error_code = error.response.get(
            "Error", {}
        ).get(
            "Code",
            "Unknown"
        )

        error_message = error.response.get(
            "Error", {}
        ).get(
            "Message",
            str(error)
        )

        print(f"AWS API error: {error_code}")
        print(f"Message: {error_message}")

        return {
            "statusCode": 500,
            "message": (
                "Failed to create CloudWatch Logs "
                "export task"
            ),
            "error_code": error_code,
            "error_message": error_message
        }

    except Exception as error:
        print(f"Unexpected error: {error}")

        return {
            "statusCode": 500,
            "message": "Unexpected Lambda execution error",
            "error": str(error)
        }