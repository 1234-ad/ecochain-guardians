# 🔌 EcoChain Guardians API Documentation

Complete API documentation for the EcoChain Guardians backend services.

## 📋 Base Information

- **Base URL**: `https://api.ecochain-guardians.com` (Production)
- **Base URL**: `http://localhost:3001` (Development)
- **API Version**: v1
- **Content Type**: `application/json`
- **Authentication**: Bearer Token (JWT) or Signature-based

## 🔐 Authentication

### Signature-Based Authentication
Most endpoints require signature-based authentication using Web3 wallet signatures.

**Headers Required:**
```http
Authorization: Bearer <signature>
X-Wallet-Address: <wallet_address>
X-Message: <signed_message>
X-Timestamp: <timestamp>
```

**Example:**
```javascript
const message = `EcoChain Guardians Authentication\nTimestamp: ${timestamp}`;
const signature = await signer.signMessage(message);
```

## 🌍 Eco Actions API

### Get All Available Actions
```http
GET /api/actions
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "actionType": 0,
      "impactScore": "100",
      "tokenReward": "50000000000000000000",
      "carbonOffset": "22000",
      "requiresVerification": true,
      "isActive": true
    }
  ]
}
```

### Submit Eco Action
```http
POST /api/actions/submit
```

**Headers:**
- `Authorization: Bearer <signature>`
- `X-Wallet-Address: <address>`

**Body:**
```json
{
  "actionId": 1,
  "evidence": "Planted 5 oak trees in Central Park",
  "metadata": {
    "location": "Central Park, NYC",
    "photos": ["ipfs://QmPhoto1", "ipfs://QmPhoto2"],
    "witnesses": ["0x1234..."]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0xabc123...",
    "actionId": 1,
    "ipfsHash": "QmEvidence123...",
    "requiresVerification": true
  }
}
```

### Get User Action History
```http
GET /api/actions/history/:address?page=1&limit=10
```

**Parameters:**
- `address` (path): Ethereum address
- `page` (query): Page number (default: 1)
- `limit` (query): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "actions": [
      {
        "id": "1",
        "actionId": "1",
        "user": "0x1234...",
        "timestamp": "1640995200",
        "evidence": "ipfs://QmEvidence...",
        "verified": true,
        "verifier": "0x5678...",
        "impactScore": "100",
        "tokenReward": "50000000000000000000"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

### Verify Action (Verifiers Only)
```http
POST /api/actions/verify
```

**Headers:**
- `Authorization: Bearer <signature>`
- `X-Wallet-Address: <verifier_address>`

**Body:**
```json
{
  "userActionId": 1,
  "approved": true,
  "comments": "Evidence verified, trees planted as claimed"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0xdef456...",
    "userActionId": 1,
    "approved": true,
    "verifier": "0x5678..."
  }
}
```

### Get Action Statistics
```http
GET /api/actions/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalActions": 15847,
    "totalImpactScore": 2847392,
    "totalCarbonOffset": 184729,
    "totalRewardsDistributed": "1847392.50",
    "actionsByType": {
      "treePlanting": 5847,
      "solarInstall": 1293,
      "wasteReduction": 3847,
      "publicTransport": 2847,
      "energyEfficiency": 1847,
      "waterConservation": 166
    },
    "recentActivity": {
      "last24h": 47,
      "last7d": 329,
      "last30d": 1847
    }
  }
}
```

## 🛡️ Guardian NFT API

### Get Guardian Details
```http
GET /api/guardians/:tokenId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tokenId": "1",
    "owner": "0x1234...",
    "level": 2,
    "impactScore": "750",
    "birthTime": "1640995200",
    "name": "Forest Guardian",
    "carbonOffset": "45000",
    "achievements": [
      "First Tree Planted",
      "Solar Pioneer",
      "Waste Warrior"
    ],
    "metadata": {
      "image": "ipfs://QmGuardian1...",
      "attributes": [
        {
          "trait_type": "Level",
          "value": "Sapling"
        }
      ]
    }
  }
}
```

### Get User's Guardian
```http
GET /api/guardians/user/:address
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasGuardian": true,
    "tokenId": "1",
    "guardian": {
      // Guardian details as above
    }
  }
}
```

### Mint Guardian
```http
POST /api/guardians/mint
```

**Headers:**
- `Authorization: Bearer <signature>`
- `X-Wallet-Address: <address>`

**Body:**
```json
{
  "name": "Ocean Guardian",
  "initialMetadata": {
    "description": "A guardian dedicated to ocean conservation"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0xghi789...",
    "tokenId": "2",
    "name": "Ocean Guardian"
  }
}
```

## 👤 User API

### Get User Profile
```http
GET /api/users/:address
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x1234...",
    "ecoBalance": "1250.75",
    "totalImpact": "2847",
    "guardianTokenId": "1",
    "joinedAt": "2024-01-15T10:30:00Z",
    "stats": {
      "actionsCompleted": 25,
      "actionsVerified": 23,
      "carbonOffset": 125000,
      "currentStreak": 7,
      "longestStreak": 15,
      "rank": 156
    },
    "achievements": [
      "First Action",
      "Tree Planter",
      "Solar Pioneer"
    ]
  }
}
```

### Get Leaderboard
```http
GET /api/users/leaderboard?type=impact&limit=100&page=1
```

**Parameters:**
- `type`: `impact`, `actions`, `carbon`, `tokens`
- `limit`: Number of users (max 100)
- `page`: Page number

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "address": "0x1234...",
        "guardianName": "Eco Master",
        "totalImpact": "15847",
        "actionsCompleted": 156,
        "carbonOffset": 847392
      }
    ],
    "userRank": {
      "rank": 156,
      "totalImpact": "2847"
    },
    "pagination": {
      "page": 1,
      "limit": 100,
      "total": 12847
    }
  }
}
```

## 📊 Analytics API

### Get Platform Statistics
```http
GET /api/analytics/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "platform": {
      "totalUsers": 12847,
      "totalGuardians": 11293,
      "totalActions": 156847,
      "totalImpactScore": 15847392,
      "totalCarbonOffset": 8473920,
      "totalRewardsDistributed": "2847392.50"
    },
    "growth": {
      "newUsersToday": 47,
      "newUsersThisWeek": 329,
      "newUsersThisMonth": 1847,
      "actionsToday": 156,
      "actionsThisWeek": 1293,
      "actionsThisMonth": 5847
    },
    "topActions": [
      {
        "actionType": 0,
        "name": "Tree Planting",
        "count": 5847,
        "percentage": 37.2
      }
    ]
  }
}
```

### Get User Analytics
```http
GET /api/analytics/user/:address
```

**Response:**
```json
{
  "success": true,
  "data": {
    "impactOverTime": [
      {
        "date": "2024-01-01",
        "cumulativeImpact": 100,
        "dailyImpact": 100
      }
    ],
    "actionsByType": {
      "treePlanting": 5,
      "solarInstall": 2,
      "wasteReduction": 8
    },
    "streakData": {
      "currentStreak": 7,
      "longestStreak": 15,
      "streakHistory": [1, 2, 3, 4, 5, 6, 7]
    },
    "rewardsOverTime": [
      {
        "date": "2024-01-01",
        "rewards": "50.0"
      }
    ]
  }
}
```

## 📁 IPFS API

### Upload File to IPFS
```http
POST /api/ipfs/upload
```

**Headers:**
- `Content-Type: multipart/form-data`
- `Authorization: Bearer <signature>`

**Body:**
- `file`: File to upload
- `metadata`: JSON string with metadata

**Response:**
```json
{
  "success": true,
  "data": {
    "ipfsHash": "QmFile123...",
    "url": "https://gateway.pinata.cloud/ipfs/QmFile123...",
    "size": 1024,
    "filename": "evidence.jpg"
  }
}
```

### Upload JSON to IPFS
```http
POST /api/ipfs/upload-json
```

**Body:**
```json
{
  "data": {
    "action": "tree-planting",
    "location": "Central Park",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "metadata": {
    "name": "Tree Planting Evidence",
    "type": "action-evidence"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ipfsHash": "QmJson123...",
    "url": "https://gateway.pinata.cloud/ipfs/QmJson123..."
  }
}
```

### Get IPFS Content
```http
GET /api/ipfs/:hash
```

**Response:**
```json
{
  "success": true,
  "data": {
    // Content from IPFS
  }
}
```

## 🔮 Oracle API

### Get Environmental Data
```http
GET /api/oracle/environmental?type=air_quality&location=NYC
```

**Parameters:**
- `type`: `air_quality`, `carbon_price`, `renewable_energy`
- `location`: Location identifier

**Response:**
```json
{
  "success": true,
  "data": {
    "type": "air_quality",
    "location": "NYC",
    "value": 85,
    "unit": "AQI",
    "timestamp": "2024-01-15T10:30:00Z",
    "source": "EPA"
  }
}
```

### Get Carbon Credit Prices
```http
GET /api/oracle/carbon-price
```

**Response:**
```json
{
  "success": true,
  "data": {
    "price": 45.50,
    "currency": "USD",
    "unit": "per_ton_co2",
    "timestamp": "2024-01-15T10:30:00Z",
    "source": "Carbon Markets"
  }
}
```

## ❌ Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `INVALID_SIGNATURE` | 401 | Invalid wallet signature |
| `INSUFFICIENT_PERMISSIONS` | 403 | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `BLOCKCHAIN_ERROR` | 502 | Blockchain interaction failed |
| `IPFS_ERROR` | 502 | IPFS operation failed |

## 📈 Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Upload endpoints**: 10 requests per minute per user
- **Verification endpoints**: 50 requests per hour per verifier

## 🔄 Webhooks

### Action Verification Webhook
```http
POST /your-webhook-endpoint
```

**Payload:**
```json
{
  "event": "action.verified",
  "data": {
    "userActionId": "1",
    "user": "0x1234...",
    "actionId": "1",
    "approved": true,
    "verifier": "0x5678...",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### Guardian Evolution Webhook
```http
POST /your-webhook-endpoint
```

**Payload:**
```json
{
  "event": "guardian.evolved",
  "data": {
    "tokenId": "1",
    "owner": "0x1234...",
    "oldLevel": 1,
    "newLevel": 2,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 🧪 Testing

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 86400,
  "environment": "production"
}
```

### Test IPFS Connection
```http
GET /api/ipfs/test
```

**Response:**
```json
{
  "success": true,
  "data": {
    "connected": true,
    "testHash": "QmTest123...",
    "responseTime": 150
  }
}
```

## 📚 SDK Examples

### JavaScript/TypeScript
```javascript
import { EcoChainAPI } from '@ecochain/sdk';

const api = new EcoChainAPI({
  baseURL: 'https://api.ecochain-guardians.com',
  signer: yourWalletSigner
});

// Submit an action
const result = await api.actions.submit({
  actionId: 1,
  evidence: 'Planted trees in local park',
  metadata: { location: 'Central Park' }
});

// Get user profile
const profile = await api.users.getProfile('0x1234...');
```

### Python
```python
from ecochain_sdk import EcoChainAPI

api = EcoChainAPI(
    base_url='https://api.ecochain-guardians.com',
    private_key='your_private_key'
)

# Submit an action
result = api.actions.submit(
    action_id=1,
    evidence='Planted trees in local park',
    metadata={'location': 'Central Park'}
)

# Get user profile
profile = api.users.get_profile('0x1234...')
```

---

For more information, visit our [GitHub repository](https://github.com/1234-ad/ecochain-guardians) or contact our support team.