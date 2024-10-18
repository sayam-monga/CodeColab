FROM public.ecr.aws/lambda/python:3.11

# Install necessary compilers and Java
RUN yum update -y && \
    yum install -y gcc-c++ java-1.8.0-openjdk-devel && \
    curl -sL https://rpm.nodesource.com/setup_14.x | bash - && \
    yum install -y nodejs && \
    yum clean all && \
    rm -rf /var/cache/yum

# Copy requirements.txt and install Python packages
COPY requirements.txt ${LAMBDA_TASK_ROOT}
RUN pip install -r requirements.txt

# Copy the Lambda function code
COPY lambda_function.py ${LAMBDA_TASK_ROOT}

# Define the handler for Lambda
CMD ["lambda_function.handler"]
