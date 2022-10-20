echo ">>> Enable @switchboardv2/$1"
echo ""

sleep 10

# deploy program
anchor deploy --provider.cluster $1