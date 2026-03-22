// Fly.io Machines API client for provisioning coding VMs.
//
// Interface is provider-agnostic: swap this module to use a different VM provider.
//
// Required env:
//   FLY_API_TOKEN — Fly.io API token
//   FLY_APP_NAME  — Fly.io app name for the coding VMs
//   VM_IMAGE      — Docker image for the coding VM

const FLY_API = 'https://api.machines.dev/v1';
const FLY_API_TOKEN = process.env.FLY_API_TOKEN;
const FLY_APP_NAME = process.env.FLY_APP_NAME || 'leg-tech-vms';
const VM_IMAGE = process.env.VM_IMAGE || 'registry.fly.io/leg-tech-vms:deployment-01KM9HPYBEHZRGA4A1NMPAAAQE';

// Secrets to inject into each VM (read from server env)
const VM_SECRETS = {
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || '',
};

async function flyApi(method, path, body) {
  const resp = await fetch(`${FLY_API}/apps/${FLY_APP_NAME}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${FLY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Fly API ${method} ${path}: ${resp.status} ${text}`);
  }
  if (resp.status === 204) return null;
  return resp.json();
}

export async function createMachine({ repoUrl, projectTitle, user }) {
  const machine = await flyApi('POST', '/machines', {
    config: {
      image: VM_IMAGE,
      env: {
        REPO_URL: repoUrl,
        PROJECT_TITLE: projectTitle,
        CREATED_BY: user,
        ...VM_SECRETS,
      },
      guest: {
        cpu_kind: 'shared',
        cpus: 2,
        memory_mb: 2048,
      },
      services: [
        {
          ports: [{ port: 443, handlers: ['tls', 'http'] }],
          protocol: 'tcp',
          internal_port: 8080,
        },
      ],
      auto_destroy: true,
      restart: { policy: 'no' },
    },
  });

  // Wait for machine to reach started state
  await flyApi('GET', `/machines/${machine.id}/wait?state=started&timeout=60`);

  return {
    machineId: machine.id,
    // fly_instance_id query param routes through Fly's proxy to the specific machine
    wsUrl: `wss://${FLY_APP_NAME}.fly.dev/ws?fly_instance_id=${machine.id}`,
    status: 'started',
  };
}

export async function destroyMachine(machineId) {
  try {
    await flyApi('POST', `/machines/${machineId}/stop`, {});
  } catch {
    // May already be stopped or destroyed
  }
  try {
    await flyApi('DELETE', `/machines/${machineId}?force=true`);
  } catch {
    // May already be destroyed (auto_destroy)
  }
}

export async function getMachineStatus(machineId) {
  const machine = await flyApi('GET', `/machines/${machineId}`);
  return {
    machineId: machine.id,
    status: machine.state,
    createdAt: machine.created_at,
  };
}
