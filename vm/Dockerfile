FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    curl git build-essential python3 python3-pip sudo \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user (Claude Code refuses to run as root)
RUN useradd -m -s /bin/bash coder \
    && echo "coder ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers \
    && mkdir -p /workspace && chown coder:coder /workspace

# Install Claude Code as coder
USER coder
RUN curl -fsSL https://claude.ai/install.sh | bash
ENV PATH="/home/coder/.local/bin:$PATH"
USER root

# WebSocket-to-PTY bridge (runs as root, spawns shell as coder)
COPY package.json /opt/package.json
RUN cd /opt && npm install
COPY ws-pty-bridge.js /opt/ws-pty-bridge.js
COPY startup.sh /opt/startup.sh
RUN chmod +x /opt/startup.sh

WORKDIR /workspace

EXPOSE 8080

CMD ["/opt/startup.sh"]
