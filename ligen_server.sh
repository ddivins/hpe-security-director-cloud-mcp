#!/bin/bash
##############################################################################
# LiGen Server (RX) Setup Script
# Configure variables below, then run: ./ligen_server.sh
##############################################################################

set -e

#=============================================================================
# NETWORK CONFIGURATION
#=============================================================================
SERVER_INTERFACE="eth0"                    # Interface to bind IPs to
SERVER_BASE_IP="2.0.0"                     # Base subnet (will use .2 to .101)
SERVER_GATEWAY="2.0.0.1"                   # Gateway/FW IP on server side
CLIENT_BASE_IP="1.0.0"                     # Client network subnet
CLIENT_GATEWAY="1.0.0.1"                   # Gateway/FW IP on client side

#=============================================================================
# SERVER CONFIGURATION
#=============================================================================
NUM_DESTINATIONS=100                       # Number of unique destination/server IPs
PROTOCOL="HttpStateful"                    # Protocol type (must match client)
DEST_PORTS="8000,8001,8002,8003,8004"    # Listening ports (must match client)

#=============================================================================
# DERIVED CONFIGURATION (Don't change)
#=============================================================================
START_SERVER_IP="${SERVER_BASE_IP}.2"
CLIENT_SUBNET="${CLIENT_BASE_IP}.0/24"

##############################################################################
# SETUP FUNCTIONS
##############################################################################

setup_network() {
  echo "========================================"
  echo "Setting up Server Network"
  echo "========================================"

  # Add server IPs
  echo "Adding ${NUM_DESTINATIONS} server IPs (${SERVER_BASE_IP}.2 to ${SERVER_BASE_IP}.$((NUM_DESTINATIONS+1)))..."
  for i in $(seq 2 $((NUM_DESTINATIONS+1))); do
    sudo ip addr add ${SERVER_BASE_IP}.$i/24 dev ${SERVER_INTERFACE} 2>/dev/null || true
  done

  # Add route back to client network via gateway
  echo "Adding route to ${CLIENT_SUBNET} via ${SERVER_GATEWAY}..."
  sudo ip route add ${CLIENT_SUBNET} via ${SERVER_GATEWAY} 2>/dev/null || true

  echo "Network configuration complete."
  echo ""
}

verify_connectivity() {
  echo "========================================"
  echo "Verifying Connectivity"
  echo "========================================"

  TEST_IP="${CLIENT_BASE_IP}.50"
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
  echo "LiGen Server Configuration"
  echo "========================================"
  echo "Server IPs:            ${NUM_DESTINATIONS} (${SERVER_BASE_IP}.2 to ${SERVER_BASE_IP}.$((NUM_DESTINATIONS+1)))"
  echo "Protocol:              ${PROTOCOL}"
  echo "Listening Ports:       ${DEST_PORTS}"
  echo ""
}

launch_ligen_server() {
  echo "========================================"
  echo "Launching LiGen Server"
  echo "========================================"

  # Build command
  CMD="./linux_trafficgen_servers_start_cli.py"
  CMD="${CMD} -d ${START_SERVER_IP}"
  CMD="${CMD} -c ${NUM_DESTINATIONS}"
  CMD="${CMD} -p ${DEST_PORTS}"
  CMD="${CMD} -t ${PROTOCOL}"

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

read -p "Press Enter to start LiGen server or Ctrl+C to cancel..."
echo ""

launch_ligen_server

echo ""
echo "========================================"
echo "LiGen server started!"
echo "========================================"
