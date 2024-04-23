# Definicja dostawcy usług (tutaj AWS) oraz określenie regionu, w którym będą tworzone zasoby (us-east-1) - konto studenckie ma przydzielnony ten region us-east-1
provider "aws" {
  region = "us-east-1"
}

# Tworzenie wirtualnej sieci prywatnej (VPC) z określonym blokiem CIDR i włączeniem wsparcia dla DNS
resource "aws_vpc" "app_vpc" {
  cidr_block = "10.0.0.0/16" # cała sieć ma zakres adresów od 10.0.0.0 do 10.0.255.255
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = {
    Name = "app_vpc"
  }
}

# Tworzenie podsieci w określonej strefie dostępności i w ramach wcześniej utworzonej VPC
resource "aws_subnet" "app_subnet" {
  vpc_id = aws_vpc.app_vpc.id
  cidr_block = "10.0.1.0/24" # zakres adresów od 10.0.1.0 do 10.0.1.255
  availability_zone = "us-east-1a"
  tags = {
    Name = "app_subnet"
  }
}

# Tworzenie bramy internetowej dla VPC, umożliwiającej komunikację z Internetem
resource "aws_internet_gateway" "app_gateway" {
  vpc_id = aws_vpc.app_vpc.id
  tags = {
    Name = "app_gateway"
  }
}

# Tworzenie tabeli routingu dla VPC z domyślną trasą do bramy internetowej
resource "aws_route_table" "app_route_table" {
  vpc_id = aws_vpc.app_vpc.id
  route {
    cidr_block = "0.0.0.0/0" # trasa domyślna wychodzą do internetu
    gateway_id = aws_internet_gateway.app_gateway.id
  }
  tags = {
    Name = "app_route_table"
  }
}

# Powiązanie tabeli routingu z podsiecią
resource "aws_route_table_association" "a" {
  subnet_id = aws_subnet.app_subnet.id
  route_table_id = aws_route_table.app_route_table.id
}

# Tworzenie grupy zabezpieczeń, która pozwala na ruch sieciowy na określonych portach i protokołach
resource "aws_security_group" "app_sg" {
  name = "app_sg"
  description = "Allow web and db traffic"
  vpc_id = aws_vpc.app_vpc.id

  # Zasady dla ruchu przychodzącego: HTTP (port 80) i SSH (port 22)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Zasady dla całego ruchu wychodzącego
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

# Uruchamianie instancji EC2 z określonym AMI, typem instancji, podsiecią, grupą zabezpieczeń, kluczem SSH oraz z automatycznym przypisaniem publicznego IP
resource "aws_instance" "app_instance" {
  ami                         = "ami-0a44aefa5a8df82eb"
  instance_type               = "t2.small"
  subnet_id                   = aws_subnet.app_subnet.id
  security_groups             = [aws_security_group.app_sg.id]
  key_name                    = "deployer-key"
  associate_public_ip_address = true
  tags = {
    Name = "TicTacToeServer"
  }
}