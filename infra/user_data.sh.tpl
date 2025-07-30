#!/bin/bash
yum -y update
amazon-linux-extras enable docker
yum -y install docker git
service docker start
usermod -aG docker ec2-user

# docker compose plugin
curl -SL https://github.com/docker/compose/releases/download/v2.29.0/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose && chmod +x $_

# login ECR (anonymous if you skip ECR)
aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${repo_url}

# env file
cat <<EOF >/home/ec2-user/app.env
POSTGRES_URI=postgres://postgres:${db_password}@${db_endpoint}:5432/healthcare
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672/
NODE_ENV=production
EOF
chown ec2-user:ec2-user /home/ec2-user/app.env

# grab compose file from repo
su - ec2-user -c "
  git clone https://github.com/<YOUR_GH>/hcs-backend.git app
  cd app
  docker compose --env-file /home/ec2-user/app.env up -d
"
