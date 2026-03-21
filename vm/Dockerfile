FROM ubuntu:24.04

RUN apt-get update && apt-get install -y \
    curl git build-essential python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code
RUN curl -fsSL https://claude.ai/install.sh | sh
ENV PATH="/root/.claude/local/bin:$PATH"

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# WebSocket-to-PTY bridge
COPY package.json /opt/package.json
RUN cd /opt && npm install
COPY ws-pty-bridge.js /opt/ws-pty-bridge.js
COPY startup.sh /opt/startup.sh
RUN chmod +x /opt/startup.sh

# Create workspace directory
RUN mkdir -p /workspace

WORKDIR /workspace

EXPOSE 8080

CMD ["/opt/startup.sh"]
