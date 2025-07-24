resource "aws_s3_bucket" "hcs_bucket" {
  bucket = var.bucket_name
  force_destroy = false

  tags = {
    Project = var.project_name
  }
}

resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.hcs_bucket.id
  rule { object_ownership = "BucketOwnerEnforced" }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.hcs_bucket.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false 
  restrict_public_buckets = false
}


resource "aws_s3_bucket_policy" "public_read" {
  bucket = aws_s3_bucket.hcs_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowPublicRead"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.hcs_bucket.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.this]
}