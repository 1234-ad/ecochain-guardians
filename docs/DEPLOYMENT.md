# 🚀 EcoChain Guardians Deployment Guide

This guide covers the complete deployment process for the EcoChain Guardians platform, from local development to production deployment.

## 📋 Prerequisites

### System Requirements
- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet
- 4GB+ RAM
- 20GB+ storage

### Required Accounts & Services
- **Infura/Alchemy**: For blockchain RPC endpoints
- **Pinata**: For IPFS file storage
- **Etherscan**: For contract verification
- **Vercel/Netlify**: For frontend hosting (optional)
- **Railway/Heroku**: For backend hosting (optional)

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/1234-ad/ecochain-guardians.git
cd ecochain-guardians
```

### 2. Install Dependencies
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..

# Backend dependencies
cd backend && npm install && cd ..
```

### 3. Environment Configuration

Create `.env` files in the root directory:

```bash
# Copy example environment file
cp .env.example .env
```

Fill in your environment variables:

```env
# Blockchain Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key

# Frontend Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
```

## 🏗️ Local Development Deployment

### 1. Start Local Blockchain
```bash
npx hardhat node
```
Keep this terminal running. Note the displayed accounts and private keys.

### 2. Deploy Smart Contracts
```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# The script will output contract addresses - save these!
```

### 3. Update Frontend Configuration
Update `frontend/.env.local`:
```env
NEXT_PUBLIC_CHAIN_ID=1337
NEXT_PUBLIC_RPC_URL=http://localhost:8545
NEXT_PUBLIC_ECO_TOKEN_ADDRESS=0x... # From deployment output
NEXT_PUBLIC_GUARDIAN_NFT_ADDRESS=0x... # From deployment output
NEXT_PUBLIC_ECO_ACTIONS_ADDRESS=0x... # From deployment output
```

### 4. Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3001`

### 5. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

### 6. Configure MetaMask
1. Add localhost network:
   - Network Name: `Localhost 8545`
   - RPC URL: `http://localhost:8545`
   - Chain ID: `1337`
   - Currency Symbol: `ETH`

2. Import test account using private key from Hardhat node output

## 🌐 Testnet Deployment (Sepolia)

### 1. Get Test ETH
- Visit [Sepolia Faucet](https://sepoliafaucet.com/)
- Request test ETH for your deployment wallet

### 2. Deploy to Sepolia
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 3. Verify Contracts
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS "CONSTRUCTOR_ARGS"
```

### 4. Update Frontend for Testnet
```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
NEXT_PUBLIC_ECO_TOKEN_ADDRESS=0x... # Sepolia deployment address
NEXT_PUBLIC_GUARDIAN_NFT_ADDRESS=0x... # Sepolia deployment address
NEXT_PUBLIC_ECO_ACTIONS_ADDRESS=0x... # Sepolia deployment address
```

## 🚀 Production Deployment

### 1. Mainnet Deployment

⚠️ **WARNING**: Mainnet deployment costs real ETH. Ensure thorough testing on testnets first.

```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Or deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon
```

### 2. Frontend Deployment (Vercel)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

2. **Environment Variables**:
   ```env
   NEXT_PUBLIC_CHAIN_ID=1
   NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
   NEXT_PUBLIC_ECO_TOKEN_ADDRESS=0x...
   NEXT_PUBLIC_GUARDIAN_NFT_ADDRESS=0x...
   NEXT_PUBLIC_ECO_ACTIONS_ADDRESS=0x...
   NEXT_PUBLIC_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
   ```

3. **Build Settings**:
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 3. Backend Deployment (Railway)

1. **Connect Repository**:
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Create new project from GitHub repo
   - Select the `backend` folder

2. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=3001
   RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
   ECO_TOKEN_ADDRESS=0x...
   GUARDIAN_NFT_ADDRESS=0x...
   ECO_ACTIONS_ADDRESS=0x...
   PINATA_API_KEY=your_pinata_api_key
   PINATA_SECRET_API_KEY=your_pinata_secret_key
   DATABASE_URL=postgresql://...
   REDIS_URL=redis://...
   ```

3. **Build Settings**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

## 🔒 Security Checklist

### Smart Contracts
- [ ] Contracts audited by security firm
- [ ] All tests passing with >95% coverage
- [ ] Gas optimizations implemented
- [ ] Access controls properly configured
- [ ] Emergency pause mechanisms tested

### Backend
- [ ] Environment variables secured
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] HTTPS enforced
- [ ] Database connections secured
- [ ] API authentication implemented

### Frontend
- [ ] Environment variables properly scoped
- [ ] Wallet connection security reviewed
- [ ] XSS protection implemented
- [ ] Content Security Policy configured
- [ ] HTTPS enforced

## 📊 Monitoring & Analytics

### 1. Contract Events Monitoring
```javascript
// Set up event listeners for important contract events
const ecoActions = getContractInstance('EcoActions');

ecoActions.on('ActionSubmitted', (userActionId, user, actionId) => {
  console.log(`New action submitted: ${actionId} by ${user}`);
  // Send to analytics service
});
```

### 2. Backend Monitoring
- Use Winston for structured logging
- Set up error tracking (Sentry)
- Monitor API response times
- Track user engagement metrics

### 3. Frontend Analytics
- Google Analytics 4
- Web3 wallet connection metrics
- User journey tracking
- Performance monitoring

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
name: Deploy EcoChain Guardians

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
      - run: npx hardhat test

  deploy-contracts:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx hardhat run scripts/deploy.js --network sepolia
        env:
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
          SEPOLIA_RPC_URL: ${{ secrets.SEPOLIA_RPC_URL }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm install && npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues

1. **Contract Deployment Fails**
   ```bash
   # Check gas price and network congestion
   npx hardhat run scripts/check-gas.js --network sepolia
   
   # Increase gas limit in hardhat.config.js
   gas: 5000000
   ```

2. **Frontend Can't Connect to Contracts**
   - Verify contract addresses in environment variables
   - Check network configuration in MetaMask
   - Ensure RPC endpoint is accessible

3. **IPFS Upload Fails**
   - Verify Pinata API credentials
   - Check file size limits
   - Test IPFS connection: `npm run test:ipfs`

4. **Backend API Errors**
   - Check environment variables
   - Verify database connection
   - Review logs: `tail -f backend/logs/combined.log`

### Performance Optimization

1. **Smart Contract Gas Optimization**
   ```bash
   # Analyze gas usage
   npx hardhat test --gas-reporter
   
   # Optimize contract code
   # Use events instead of storage for logs
   # Batch operations where possible
   ```

2. **Frontend Performance**
   ```bash
   # Analyze bundle size
   cd frontend && npm run analyze
   
   # Optimize images and assets
   # Implement code splitting
   # Use React.memo for expensive components
   ```

3. **Backend Performance**
   - Implement Redis caching
   - Use database connection pooling
   - Add request/response compression
   - Implement API rate limiting

## 📈 Scaling Considerations

### Layer 2 Solutions
- **Polygon**: Lower gas fees, faster transactions
- **Arbitrum**: Ethereum-compatible L2
- **Optimism**: Optimistic rollup solution

### Database Scaling
- Implement read replicas
- Use connection pooling
- Consider database sharding
- Implement caching strategies

### CDN & Caching
- Use Cloudflare for static assets
- Implement Redis for API caching
- Use browser caching headers
- Optimize image delivery

## 🎯 Post-Deployment Tasks

1. **Contract Verification**
   - Verify all contracts on Etherscan
   - Update documentation with verified addresses
   - Test all contract functions

2. **Frontend Testing**
   - Test wallet connections
   - Verify all user flows
   - Check mobile responsiveness
   - Test error handling

3. **Backend Testing**
   - Test all API endpoints
   - Verify IPFS integration
   - Check database connections
   - Test error handling

4. **Security Review**
   - Run security scans
   - Test access controls
   - Verify input validation
   - Check for common vulnerabilities

5. **Documentation Updates**
   - Update README with deployment info
   - Document API endpoints
   - Create user guides
   - Update troubleshooting docs

---

🎉 **Congratulations!** Your EcoChain Guardians platform is now deployed and ready to help users make a positive environmental impact through blockchain technology!