const revealTargets = document.querySelectorAll('.reveal-section, .reveal-card');
const terminalWindow = document.getElementById('terminal-window');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.18 }
);

revealTargets.forEach((target) => revealObserver.observe(target));

const terminalScript = [
  {
    role: 'User',
    text: "Deploy when BTC basis is genuinely attractive. Maximise capital efficiency, but don't let me get caught babysitting funding flips and margin stress all day.",
  },
  {
    role: 'Agent',
    text: "Understood. Current BTC funding is 17.8% APR, borrow drag is 2.9% APR, so net basis yield is 14.9% APR. That supports a 100/0 posture: using the long BTC collateral to cover the short gives us full capital efficiency while the edge is strong.",
  },
  {
    role: 'System',
    text: `Watching live funding and borrow curves…
Checking liquidation buffer versus BTC mark price…
Verifying spot and short notionals stay in equilibrium…
Publishing approval and order links as execution completes…`,
  },
  {
    role: 'User',
    text: 'And if that yield compresses or the trade starts getting uglier?',
  },
  {
    role: 'Agent',
    text: 'Then I stop behaving like a static bot. If net yield slips, or collateral efficiency stops compensating for the risk, I can rotate from 100/0 into 50/50 to widen the liquidation buffer, cut drift, and avoid bleeding the edge away through forced reactions.',
  },
  {
    role: 'System',
    text: `Funding has compressed to 6.4% APR…
Borrow drag is now 2.1% APR…
Net yield is 4.3% APR and falling…
Shifting out of 100/0, preserving delta-neutral exposure, and reducing liquidation sensitivity…`,
  },
  {
    role: 'Agent',
    text: 'That is the work you would normally be doing manually: reading funding, comparing net yield, sizing the collateral mix, deciding when to stay aggressive, and deciding when to step back before fee churn or margin pressure erases the opportunity.',
  },
];

function createTerminalLine(role) {
  const line = document.createElement('div');
  line.className = 'terminal-line';
  const roleNode = document.createElement('div');
  roleNode.className = 'terminal-role';
  roleNode.textContent = role;
  const contentNode = document.createElement('div');
  contentNode.className = 'terminal-content terminal-cursor';
  line.append(roleNode, contentNode);
  terminalWindow.appendChild(line);
  requestAnimationFrame(() => line.classList.add('is-visible'));
  return contentNode;
}

function typeText(node, text, speed = 18) {
  return new Promise((resolve) => {
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      node.textContent = text.slice(0, index);
      if (index >= text.length) {
        clearInterval(interval);
        node.classList.remove('terminal-cursor');
        resolve();
      }
    }, speed);
  });
}

async function playTerminalConversation() {
  if (!terminalWindow) {
    return;
  }
  for (const step of terminalScript) {
    const contentNode = createTerminalLine(step.role);
    await typeText(contentNode, step.text, step.role === 'System' ? 12 : 18);
    await new Promise((resolve) => setTimeout(resolve, 650));
  }
}

playTerminalConversation();
