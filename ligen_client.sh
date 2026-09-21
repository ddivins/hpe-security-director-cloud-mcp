#!/bin/bash
##############################################################################
# LiGen Client (TX) Traffic Generator Script
# Configure variables below, then run: ./ligen_client.sh
##############################################################################

set -e

#=============================================================================
# NETWORK CONFIGURATION
#=============================================================================
CLIENT_INTERFACE="eth0"                    # Interface to bind IPs to
CLIENT_BASE_IP="1.0.0"                     # Base subnet (will use .2 to .101)
CLIENT_GATEWAY="1.0.0.1"                   # Gateway/FW IP on client side
SERVER_BASE_IP="2.0.0"                     # Destination server subnet
SERVER_GATEWAY="2.0.0.1"                   # Gateway/FW IP on server side

#=============================================================================
# TRAFFIC GENERATION CONFIGURATION
#=============================================================================
NUM_SOURCES=100                            # Number of unique source IPs
NUM_DESTINATIONS=100                       # Number of unique destination IPs
PROTOCOL="HttpStateful"                    # Protocol type (HttpStateful, Tcp, Udp, etc.)
DEST_PORTS="8000,8001,8002,8003,8004"    # Destination port(s) - comma separated for diversity
SESSIONS_PER_SOURCE=1                      # Concurrent sessions per source IP
TRANSACTIONS_PER_SESSION=10                # HTTP transactions per session
TEST_DURATION="30m"                        # Test duration (30m, 1h, etc.) Use 's' for seconds
PAYLOAD_SIZE=""                            # Optional: payload size in bytes (empty = default)

#=============================================================================
# DERIVED CONFIGURATION (Don't change)
#=============================================================================
START_CLIENT_IP="${CLIENT_BASE_IP}.2"
START_SERVER_IP="${SERVER_BASE_IP}.2"
DEST_SUBNET="${SERVER_BASE_IP}.0/24"

##############################################################################
# SETUP FUNCTIONS
##############################################################################

setup_network() {
  echo "========================================"
  echo "Setting up Client Network"
  echo "========================================"

  # Add 100 client IPs
  echo "Adding ${NUM_SOURCES} client IPs (${CLIENT_BASE_IP}.2 to ${CLIENT_BASE_IP}.$((NUM_SOURCES+1)))..."
  for i in $(seq 2 $((NUM_SOURCES+1))); do
    sudo ip addr add ${CLIENT_BASE_IP}.$i/24 dev ${CLIENT_INTERFACE} 2>/dev/null || true
  done

  # Add route to server network via gateway
  echo "Adding route to ${DEST_SUBNET} via ${CLIENT_GATEWAY}..."
  sudo ip route add ${DEST_SUBNET} via ${CLIENT_GATEWAY} 2>/dev/null || true

  echo "Network configuration complete."
  echo ""
}

verify_connectivity() {
  echo "========================================"
  echo "Verifying Connectivity"
  echo "========================================"

  TEST_IP="${SERVER_BASE_IP}.50"
  echo "Testing connectivity to ${TEST_IP}..."

  if ping -c 1 -W 2 ${TEST_IP} > /dev/null 2>&1; then
    echo "✓ Connectivity verified!"
    echo ""
  else
    echo "✗ ERROR: Cannot reach ${TEST_IP}"
    echo "  Check firewall/routing configuration"
    exit 1
  fi
}

show_config() {
  echo "========================================"
  echo "LiGen Traffic Configuration"
  echo "========================================"
  echo "Source IPs:            ${NUM_SOURCES} (${CLIENT_BASE_IP}.2 to ${CLIENT_BASE_IP}.$((NUM_SOURCES+1)))"
  echo "Destination IPs:       ${NUM_DESTINATIONS} (${SERVER_BASE_IP}.2 to ${SERVER_BASE_IP}.$((NUM_DESTINATIONS+1)))"
  echo "Protocol:              ${PROTOCOL}"
  echo "Destination Ports:     ${DEST_PORTS}"
  echo "Sessions/Source:       ${SESSIONS_PER_SOURCE}"
  echo "Transactions/Session:  ${TRANSACTIONS_PER_SESSION}"
  echo "Test Duration:         ${TEST_DURATION}"
  if [ -n "${PAYLOAD_SIZE}" ]; then
    echo "Payload Size:          ${PAYLOAD_SIZE} bytes"
  fi
  echo ""
}

launch_ligen() {
  echo "========================================"
  echo "Launching LiGen Traffic Generation"
  echo "========================================"

  # Build command
  CMD="./linux_trafficgen_clients_start_cli.py"
  CMD="${CMD} -s ${START_CLIENT_IP}"
  CMD="${CMD} -d ${START_SERVER_IP}"
  CMD="${CMD} -c ${NUM_SOURCES}"
  CMD="${CMD} -a ${NUM_DESTINATIONS}"
  CMD="${CMD} -t ${PROTOCOL}"
  CMD="${CMD} -S ${SESSIONS_PER_SOURCE}"
  CMD="${CMD} -p ${DEST_PORTS}"
  CMD="${CMD} -N ${TRANSACTIONS_PER_SESSION}"
  CMD="${CMD} -n ${TEST_DURATION}"
  if [ -n "${PAYLOAD_SIZE}" ]; then
    CMD="${CMD} -l ${PAYLOAD_SIZE}"
  fi

  echo "Command: ${CMD}"
  echo ""

  eval ${CMD}
}

##############################################################################
# MAIN EXECUTION
##############################################################################

setup_network
verify_connectivity
show_config

read -p "Press Enter to start LiGen traffic generation or Ctrl+C to cancel..."
echo ""

launch_ligen

echo ""
echo "========================================"
echo "LiGen test completed!"
echo "========================================"
