# Dockerfile
FROM amazonlinux:2023

RUN dnf update -y && \
    dnf install -y --allowerasing \
      gcc \
      git \
      make \
      tar \
      zip \
      curl \
      vim \
      unzip \
      python3 \
      python3-pip \
      shadow-utils \
      util-linux-user && \
    dnf clean all

# Install Rust
RUN curl https://sh.rustup.rs -sSf | bash -s -- -y && \
    echo 'source /root/.cargo/env' >> /root/.bashrc

# Set working dir and copy source
WORKDIR /workspace
COPY . .

CMD ["/bin/bash"]

