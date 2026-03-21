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
USER root

# Pre-clone all project repos at build time (parallel)
RUN cd /workspace && \
    for repo in \
      unified-hearing-markup-data youtube-video-dashboard gao-hearing-connector \
      floor-schedule committee-transcripts witness-database \
      appropriations-notices-tracker submit-appropriations-documentation appropriations-tracker \
      crs-reports-to-html gao-reports-reader crs-reports-to-wikipedia \
      house-disbursements-data bills-to-committee bill-delay-tracker \
      congressional-job-tracker govtrack-newsletter-generator resolution-alerts \
      congressional-rfps house-committee-spending committee-funding-tracker \
      appropriations-explorer cbj-approps-alignment leg-tech-editor-test-app; \
    do git clone "https://github.com/jeremyschlatter-intern/${repo}.git" "/workspace/${repo}" & done && wait \
    && chown -R coder:coder /workspace

# WebSocket-to-PTY bridge (runs as root, spawns shell as coder)
COPY package.json /opt/package.json
RUN cd /opt && npm install
COPY ws-pty-bridge.js /opt/ws-pty-bridge.js
COPY startup.sh /opt/startup.sh
RUN chmod +x /opt/startup.sh

WORKDIR /workspace

EXPOSE 8080

CMD ["/opt/startup.sh"]
