# Define the AWS provider and specify the region as us-east-1
provider "aws" {
  region = "us-east-1"
}

# Create a VPC with the specified CIDR block, enable DNS support and hostnames, and assign tags
resource "aws_vpc" "app_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "app_vpc"
  }
}

# Create a subnet within the VPC, specify its CIDR block, availability zone, and assign tags
resource "aws_subnet" "app_subnet" {
  vpc_id            = aws_vpc.app_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"
  tags = {
    Name = "app_subnet"
  }
}

# Create an internet gateway and attach it to the VPC, and assign tags
resource "aws_internet_gateway" "app_gateway" {
  vpc_id = aws_vpc.app_vpc.id
  tags = {
    Name = "app_gateway"
  }
}

# Create a route table within the VPC, specify a default route to the internet gateway, and assign tags
resource "aws_route_table" "app_route_table" {
  vpc_id = aws_vpc.app_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.app_gateway.id
  }
  tags = {
    Name = "app_route_table"
  }
}

# Associate the subnet with the route table
resource "aws_route_table_association" "my_route_table_association" {
  subnet_id      = aws_subnet.app_subnet.id
  route_table_id = aws_route_table.app_route_table.id
}

# Create a security group to control inbound and outbound traffic, and assign tags
resource "aws_security_group" "app_sg" {
  name        = "tic_tac_toe_sg"
  description = "Allow web and db traffic"
  vpc_id      = aws_vpc.app_vpc.id

  # Allow SSH, HTTP, and custom ports 3000 and 5000 inbound traffic
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "app_sg"
  }
}

# Launch an EC2 instance with specified AMI, instance type, subnet, security group, SSH key, assign public IP, and assign tags
resource "aws_instance" "app_instance" {
  ami                         = "ami-0a44aefa5a8df82eb" // Replace with appropriate AMI
  instance_type               = "t2.small"
  subnet_id                   = aws_subnet.app_subnet.id
  security_groups             = [aws_security_group.app_sg.id]
  key_name                    = "deployer-key" # Replace with your SSH key pair name if you plan to SSH into your instance
  associate_public_ip_address = true
  tags = {
    Name = "TicTacToeServer"
  }
}