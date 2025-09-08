# Contributing to EcoChain Guardians

We're excited that you're interested in contributing to EcoChain Guardians! This document outlines the process for contributing to our project.

## 🌱 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- MetaMask or another Web3 wallet

### Setup Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/ecochain-guardians.git
   cd ecochain-guardians
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

4. **Start local blockchain**
   ```bash
   npx hardhat node
   ```

5. **Deploy contracts locally**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. **Start frontend**
   ```bash
   cd frontend && npm run dev
   ```

## 📝 How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/1234-ad/ecochain-guardians/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Features

1. Check existing [Issues](https://github.com/1234-ad/ecochain-guardians/issues) and [Discussions](https://github.com/1234-ad/ecochain-guardians/discussions)
2. Create a new issue with:
   - Clear feature description
   - Use case and benefits
   - Possible implementation approach

### Code Contributions

1. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow our coding standards
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm test
   npx hardhat test
   ```

4. **Commit your changes**
   ```bash
   git commit -m "feat: add new eco action type"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🎯 Areas We Need Help

### Smart Contracts
- New eco action types
- Gas optimization
- Security improvements
- Integration with external oracles

### Frontend
- UI/UX improvements
- Mobile responsiveness
- Performance optimization
- Accessibility features

### Backend
- API development
- Database optimization
- Caching strategies
- Analytics implementation

### Documentation
- Code documentation
- User guides
- API documentation
- Video tutorials

### Testing
- Unit tests
- Integration tests
- End-to-end tests
- Security audits

## 📋 Coding Standards

### Smart Contracts
- Use Solidity 0.8.20+
- Follow OpenZeppelin patterns
- Include comprehensive NatSpec comments
- Gas-efficient implementations
- Security-first approach

### Frontend
- TypeScript for type safety
- React functional components with hooks
- Tailwind CSS for styling
- Responsive design principles
- Accessibility compliance (WCAG 2.1)

### General
- Clear, descriptive variable names
- Comprehensive error handling
- Consistent code formatting
- Meaningful commit messages

## 🧪 Testing Guidelines

### Smart Contract Tests
```bash
npx hardhat test
npx hardhat coverage
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e
```

### Test Requirements
- Minimum 80% code coverage
- All edge cases covered
- Integration tests for user flows
- Gas usage tests for contracts

## 📚 Documentation

- Update README.md for significant changes
- Add inline code comments
- Update API documentation
- Include examples for new features

## 🔄 Pull Request Process

1. **PR Title**: Use conventional commits format
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation
   - `test:` for tests
   - `refactor:` for code refactoring

2. **PR Description**: Include
   - What changes were made
   - Why the changes were necessary
   - How to test the changes
   - Screenshots for UI changes

3. **Review Process**
   - All PRs require at least one review
   - Address all review comments
   - Ensure CI/CD passes
   - Squash commits before merging

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Special NFT badges for significant contributions
- Community Discord roles

## 💬 Getting Help

- Join our [Discord](https://discord.gg/ecochain-guardians)
- Start a [Discussion](https://github.com/1234-ad/ecochain-guardians/discussions)
- Reach out to maintainers

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for helping make EcoChain Guardians better! 🌍✨