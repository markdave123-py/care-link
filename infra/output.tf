output "app_access_key_id" {
  description = "Access-key ID for the application user"
  value       = aws_iam_access_key.app_key.id
  sensitive   = true
}

output "app_secret_access_key" {
  description = "Secret access key"
  value       = aws_iam_access_key.app_key.secret
  sensitive   = true
}

output "bucket_name" {
  value = aws_s3_bucket.hcs_bucket.bucket
}

output "ec2_public_ip" {
  value = aws_instance.app_host.public_ip
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.endpoint
}
