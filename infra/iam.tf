resource "aws_iam_user" "app" {
  name = var.project_name
  tags = {
    Project = var.project_name
  }
}

data "aws_iam_policy_document" "app_s3_policy" {
  statement {
    sid    = "AppBucketAccess"
    effect = "Allow"

    actions = [
      "s3:ListBucket"
    ]

    resources = [
      aws_s3_bucket.hcs_bucket.arn,
      "${aws_s3_bucket.hcs_bucket.arn}/*"
    ]
  }

  statement {
    sid       = "ObjectRW"
    effect    = "Allow"
    actions   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.hcs_bucket.arn}/*"]
  }
}

resource "aws_iam_user_policy" "app_inline" {
  name   = "${var.project_name}-s3-policy"
  user   = aws_iam_user.app.name
  policy = data.aws_iam_policy_document.app_s3_policy.json
}

resource "aws_iam_access_key" "app_key" {
  user   = aws_iam_user.app.name
  status = "Active"
}
