# LiGen Firewall Testing Setup

Two-VM setup for generating stateful HTTP traffic across a firewall using Juniper's LiGen tool.

## Architecture

```
Client VM (TX)                    Server VM (RX)
┌─────────────────────┐          ┌─────────────────────┐
│ 1.0.0.2 - 1.0.0.101 │          │ 2.0.0.2 - 2.0.0.101 │
│ (100 client IPs)    │          │ (100 server IPs)    │
└────────┬────────────┘          └─────────┬──────────┘
         │                               │
         │ eth0 (1.0.0.x)                │ eth0 (2.0.0.x)
         │                               │
         ├─────────────────────┬─────────┤
                               │
                          FIREWALL
                       (1.0.0.1 / 2.0.0.1)
                               │
```

## Quick Start

### 1. On Server VM (Setup first)

```bash
# Copy ligen_server.sh to server VM
scp ligen_server.sh user@server-vm:~/

# SSH into server
ssh user@server-vm

# Make executable
chmod +x ligen_server.sh

# Run server setup (add IPs, start LiGen server)
./ligen_server.sh
```

**Server script will:**
- Add 100 server IPs (2.0.0.2 - 2.0.0.101)
- Add route to client network via firewall
- Verify connectivity to client side
- Start LiGen server listening on ports 8000-8004

### 2. On Client VM (Launch traffic)

```bash
# Copy ligen_client.sh to client VM
scp ligen_client.sh user@client-vm:~/

# SSH into client
ssh user@client-vm

# Make executable
chmod +x ligen_client.sh

# Run client to generate traffic
./ligen_client.sh
```

**Client script will:**
- Add 100 client IPs (1.0.0.2 - 1.0.0.101)
- Add route to server network via firewall
- Verify connectivity to server side
- Show configuration summary
- Launch LiGen traffic generation

## Customization

Edit the top section of each script to customize:

### Network Settings
```bash
CLIENT_BASE_IP="1.0.0"           # Change source subnet
SERVER_BASE_IP="2.0.0"           # Change destination subnet
CLIENT_INTERFACE="eth0"          # Change if different interface
NUM_SOURCES=100                  # Number of client IPs
NUM_DESTINATIONS=100             # Number of server IPs
```

### Traffic Settings
```bash
PROTOCOL="HttpStateful"          # Http, Tcp, Udp, etc.
DEST_PORTS="8000,8001,8002"     # Destination ports (port diversity)
SESSIONS_PER_SOURCE=1            # Concurrent sessions per source
TRANSACTIONS_PER_SESSION=10      # HTTP transactions per session
TEST_DURATION="30m"              # 30m, 1h, 10s, etc.
PAYLOAD_SIZE="1024"              # Optional: packet size in bytes
```

## Testing Scenarios

### Scenario 1: Basic HTTP (GET/200)
```bash
PROTOCOL="HttpStateful"
TRANSACTIONS_PER_SESSION=1       # Single transaction per connection
TEST_DURATION="10m"
```

### Scenario 2: Long-lived Sessions
```bash
PROTOCOL="HttpStateful"
TRANSACTIONS_PER_SESSION=100     # Many transactions per connection
TEST_DURATION="1h"               # Longer test
```

### Scenario 3: Port Diversity Test
```bash
DEST_PORTS="80,443,8080,8443,3000,5000"  # Many different ports
TRANSACTIONS_PER_SESSION=5
```

### Scenario 4: High Concurrency
```bash
SESSIONS_PER_SOURCE=10           # 10 sessions from each source
NUM_SOURCES=50                   # 50 sources × 10 sessions = 500 total
```

## Firewall Testing Tips

### Monitor Firewall State
While traffic is running, on your firewall check:
```bash
# Juniper OS example
show security flow session
show security flow statistics
```

### Verify Traffic Crossing
```bash
# On firewall interfaces
monitor traffic interface <interface> detail

# Watch packets flowing through
```

### Check Session Table
```bash
# Count active sessions
show security flow session brief | count

# View specific flows
show security flow session destination-ip 2.0.0.50
```

## Troubleshooting

### Can't reach server IPs
```bash
# Verify routing on client
ip route show
# Should show: 2.0.0.0/24 via 1.0.0.1

# Ping test
ping 2.0.0.50

# Check if FW allows ICMP
```

### IPs already in use error
```bash
# If re-running test and getting "File exists" errors:
# The script handles this with '|| true' but you can also clean:
for i in {2..101}; do
  sudo ip addr del 1.0.0.$i/24 dev eth0 2>/dev/null || true
done
```

### LiGen command not found
```bash
# Make sure you're in the LiGen directory
cd ~/ligen/

# Or add to PATH
export PATH=$PATH:~/ligen/
```

## Cleanup

After test completes, IPs persist until reboot or manual removal:

```bash
# Optional cleanup (comment out in scripts to skip)
for i in {2..101}; do
  sudo ip addr del 1.0.0.$i/24 dev eth0 2>/dev/null || true
done
sudo ip route del 2.0.0.0/24 via 1.0.0.1 2>/dev/null || true
```

## Verification Checklist

- [ ] Server VM: IPs configured (ip addr show)
- [ ] Server VM: Route configured (ip route show)
- [ ] Server VM: Can ping client IPs
- [ ] Client VM: IPs configured (ip addr show)
- [ ] Client VM: Route configured (ip route show)
- [ ] Client VM: Can ping server IPs
- [ ] Firewall: Check allows traffic on port 8000-8004
- [ ] LiGen server: Started successfully
- [ ] LiGen client: Traffic showing as sent
- [ ] Firewall: Sessions appearing in state table

## Common LiGen Command Reference

```bash
# Show help
./linux_trafficgen_clients_start_cli.py --help

# Stop traffic (from another terminal)
./linux_trafficgen_clients_stop.py

# Check running processes
ps aux | grep trafficgen
```
