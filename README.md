# 🎯 Auto BPMN - Intelligent Process Modeling Platform

<div align="center">

![Auto BPMN Banner](https://img.shields.io/badge/Auto%20BPMN-AI%20Powered-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSIjMDA3OEQ0Ii8+Cjwvc3ZnPgo=)

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/laza/auto-bpmn)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.x-green)](https://mongodb.com/)

*Transform your business processes into professional BPMN diagrams with the power of AI*

</div>

---

## 🌟 Overview

**Auto BPMN** is a cutting-edge, AI-powered platform that revolutionizes business process modeling. Built with modern technologies and intelligent algorithms, it transforms natural language descriptions into professional BPMN (Business Process Model and Notation) diagrams instantly.

> "Simplifying complex business processes through intelligent automation" - *Laza*

### ✨ Key Highlights

- 🤖 **AI-Driven Intelligence**: Powered by OpenAI GPT and HuggingFace models
- 🎨 **Interactive Design**: Real-time BPMN editing with professional-grade visualization
- 🏭 **Industry-Specific**: Tailored optimization for Manufacturing, Healthcare, and Finance
- 📱 **Responsive Experience**: Seamless across all devices and platforms
- 🚀 **Production Ready**: Enterprise-grade security and performance

---

## 🎯 Features

<table>
<tr>
<td>

### 🧠 AI-Powered Generation
- Natural language to BPMN conversion
- Smart process element detection
- Context-aware task identification
- Automatic flow generation

</td>
<td>

### 🛠️ Advanced Editor
- Interactive BPMN.io integration
- Real-time diagram manipulation
- Professional visual rendering
- Multiple export formats

</td>
</tr>
<tr>
<td>

### 📋 Guided Workflow
- Step-by-step process builder
- Industry-specific questionnaires
- Smart validation and suggestions
- Progress tracking

</td>
<td>

### ⚡ Process Optimization
- AI-powered improvement suggestions
- Bottleneck identification
- Efficiency recommendations
- Performance analytics

</td>
</tr>
</table>

---

## 🏗️ Architecture

### Tech Stack Overview

<div align="center">

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + Vite | Modern, fast user interface |
| **Styling** | TailwindCSS | Responsive, utility-first design |
| **Visualization** | BPMN.io | Professional diagram rendering |
| **Backend** | Node.js + Express | RESTful API server |
| **Database** | MongoDB + Mongoose | Document-based data storage |
| **AI Engine** | OpenAI + HuggingFace | Natural language processing |
| **Security** | JWT + Helmet | Authentication & protection |

</div>

### System Architecture

```mermaid
graph TB
    A[User Interface] --> B[React Frontend]
    B --> C[API Gateway]
    C --> D[Express Server]
    D --> E[AI Service]
    D --> F[BPMN Service]
    D --> G[MongoDB]
    E --> H[OpenAI API]
    E --> I[HuggingFace API]
    F --> J[Process Optimizer]
```

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:

- **Node.js** ≥ 18.0.0
- **MongoDB** ≥ 6.0.0  
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone & Navigate**
   ```bash
   git clone https://github.com/KhanhPN03/auto_bpmn.git
   cd auto-bpmn
   ```

2. **Install Dependencies**
   ```bash
   npm run install-deps
   ```

3. **Environment Setup**
   
   Create `server/.env`:
   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/auto_bpmn
   
   # Server Configuration  
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_super_secure_jwt_secret_key
   
   # AI API Keys (at least one required)
   OPENAI_API_KEY=sk-your-openai-key-here
   HUGGINGFACE_API_KEY=hf_your-huggingface-key-here
   
   # Client Configuration
   CLIENT_URL=http://localhost:3000
   ```

4. **Launch Application**
   ```bash
   npm run dev
   ```

5. **Access Platform**
   
   Open your browser to [http://localhost:3000](http://localhost:3000)

---

## 📱 Usage Guide

### 1. **Text-to-BPMN Generation**
```
Simply describe your process in natural language:

"The customer places an order, we verify payment, 
check inventory, ship the product, and send confirmation."
```

### 2. **Guided Process Builder**
- Follow interactive questionnaires
- Industry-specific templates
- Step-by-step validation
- Professional guidance

### 3. **Process Optimization**
- AI-powered analysis
- Bottleneck identification  
- Efficiency suggestions
- Best practice recommendations

### 4. **Export & Integration**
- PNG/SVG for presentations
- XML for BPM systems
- PDF for documentation
- API integration ready

---

## 🏭 Industry Solutions

<div align="center">

| Industry | Use Cases | Features |
|----------|-----------|----------|
| **🏭 Manufacturing** | Production workflows, Quality control, Supply chain | Lean optimization, Resource planning |
| **🏥 Healthcare** | Patient care, Medical procedures, Compliance | HIPAA compliance, Safety protocols |
| **💰 Finance** | Risk assessment, Loan processing, Auditing | Regulatory compliance, Risk management |

</div>

---

## � Development

### Project Structure

```
auto-bpmn/
├── 📁 client/                    # Frontend application
│   ├── 📁 src/
│   │   ├── 📁 components/        # Reusable UI components
│   │   ├── 📁 pages/            # Application pages
│   │   ├── 📁 services/         # API integrations
│   │   └── 📁 utils/            # Helper functions
│   └── 📄 package.json
├── 📁 server/                    # Backend application  
│   ├── 📁 controllers/          # Business logic
│   ├── 📁 models/               # Database schemas
│   ├── 📁 services/             # AI & BPMN services
│   ├── 📁 middleware/           # Custom middleware
│   └── 📄 package.json
├── 📁 docs/                     # Documentation
├── 🐳 docker-compose.yml        # Container orchestration
└── 📋 README.md                 # Project documentation
```

### API Reference

<details>
<summary><strong>🔗 Core Endpoints</strong></summary>

#### Process Management
```http
POST /api/processes/generate      # Generate from text
POST /api/processes/guided        # Generate from questionnaire  
POST /api/processes/optimize      # AI optimization
GET  /api/processes/:id           # Retrieve process
PUT  /api/processes/:id           # Update process
```

#### Question Sets
```http
GET /api/questions/bpmn                    # BPMN questions
GET /api/questions/industry/:industry      # Industry-specific
```

#### Export Services
```http
POST /api/export/png              # PNG export
POST /api/export/svg              # SVG export
POST /api/export/xml              # XML export
```

</details>

---

## 🚀 Deployment

### Production Deployment

#### Docker Deployment (Recommended)
```bash
# Build and deploy
docker-compose up --build -d

# Production environment
docker-compose -f docker-compose.prod.yml up -d
```

#### Manual Deployment
```bash
# 1. Build frontend
cd client && npm run build

# 2. Configure production environment
export NODE_ENV=production
export MONGODB_URI=your_production_uri

# 3. Start server
cd ../server && npm start
```

### Environment Configuration

<details>
<summary><strong>⚙️ Production Variables</strong></summary>

```env
# Production Environment
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/auto_bpmn

# Security
JWT_SECRET=your_production_jwt_secret_minimum_32_characters
CORS_ORIGIN=https://your-domain.com

# AI Services
OPENAI_API_KEY=your_production_openai_key
HUGGINGFACE_API_KEY=your_production_hf_key

# Client
CLIENT_URL=https://your-frontend-domain.com
```

</details>

---

## 🛡️ Security & Performance

### Security Features
- 🔐 **JWT Authentication** - Secure token-based auth
- 🛡️ **Input Validation** - XSS and injection protection  
- 🚦 **Rate Limiting** - API abuse prevention
- 🔒 **CORS Configuration** - Cross-origin security
- 🛠️ **Helmet Integration** - Security headers

### Performance Optimizations
- ⚡ **Vite Build System** - Lightning-fast development
- 🗜️ **Code Splitting** - Optimized bundle loading
- 💾 **MongoDB Indexing** - Fast database queries
- 🎯 **API Caching** - Reduced response times

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Submit** a pull request

### Code Standards

- **ESLint** configuration for consistent code style
- **Prettier** for automatic code formatting
- **Husky** pre-commit hooks for quality assurance
- **Jest** for comprehensive testing

---

## 📊 Roadmap

### Phase 1: Core Platform ✅
- [x] AI-powered BPMN generation
- [x] Interactive editing interface
- [x] Multi-industry support
- [x] Export capabilities

### Phase 2: Advanced Features 🚧
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Custom AI model training
- [ ] Enterprise SSO integration

### Phase 3: Ecosystem 📋
- [ ] Mobile applications
- [ ] Third-party integrations
- [ ] Marketplace for templates
- [ ] API monetization platform

---

## 📞 Support & Community

### Getting Help

- 📖 **Documentation**: [docs.auto-bpmn.laza.dev](https://docs.auto-bpmn.laza.dev)
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/laza/auto-bpmn/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/laza/auto-bpmn/discussions)
- 📧 **Contact**: [support@laza.dev](mailto:support@laza.dev)

### Community

Join our growing community of process optimization enthusiasts:

- 🌟 **Star** this repository if you find it useful
- 🐦 **Follow** [@LaziDev](https://twitter.com/LaziDev) for updates
- 📧 **Subscribe** to our newsletter for tips and tutorials

---

## 🙏 Acknowledgments

Special thanks to:
- **OpenAI** for providing powerful language models
- **BPMN.io** for excellent diagramming tools  
- **MongoDB** for robust database solutions
- **Vercel** for hosting and deployment platform
- **The Open Source Community** for continuous inspiration

---

<div align="center">

**🔮 Built with passion by [@KhanhPN03](https://github.com/KhanhPN03)**

*Transforming business processes through intelligent automation*

**[⭐ Star this project](https://github.com/laza/auto-bpmn) • [🍴 Fork it](https://github.com/laza/auto-bpmn/fork) • [📢 Share it](https://twitter.com/intent/tweet?text=Check%20out%20Auto%20BPMN%20-%20AI-powered%20process%20modeling%20platform%20by%20@LaziDev&url=https://github.com/laza/auto-bpmn)**

</div>
   ```bash
   npm run install-deps
   ```

3. **Environment Configuration**
   
   Create `.env` file in the `server` directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/auto_bpmn
   
   # Server
   PORT=5000
   NODE_ENV=development
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # AI APIs (Choose one or configure multiple as fallbacks)
   OPENAI_API_KEY=your_openai_api_key_here
   HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode (runs both client and server)
   npm run dev
   ```

   Or run separately:
   ```bash
   # Terminal 1: Backend
   npm run server
   
   # Terminal 2: Frontend
   npm run client
   ```

## 🌐 Usage

1. **Access the application** at `http://localhost:3000`

2. **Choose your input method:**
   - **Describe Your Process**: Enter a free-text description
   - **Guided BPMN Builder**: Follow the step-by-step questionnaire

3. **Generate and Edit**: AI creates your BPMN diagram, edit as needed

4. **Optimize**: Use the AI optimization assistant to improve your process

5. **Export**: Download your final diagram in your preferred format

## 📁 Project Structure

```
auto_bpmn/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Main page components
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility functions
│   │   ├── data/          # Question sets and static data
│   │   └── styles/        # CSS and styling
│   ├── package.json
│   └── vite.config.js
├── server/                # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── services/         # Business logic
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration files
│   ├── package.json
│   └── index.js
├── docs/                 # Documentation
├── docker-compose.yml    # Docker configuration
├── Dockerfile           # Docker image definition
└── README.md
```

## 🔑 API Endpoints

### Process Management
- `POST /api/processes/generate` - Generate BPMN from text
- `POST /api/processes/guided` - Generate from questionnaire
- `POST /api/processes/optimize` - Optimize existing process
- `GET /api/processes/:id` - Get process by ID
- `PUT /api/processes/:id` - Update process

### Question Sets
- `GET /api/questions/bpmn` - Get BPMN building questions
- `GET /api/questions/industry/:industry` - Get industry-specific questions

### Export
- `POST /api/export/png` - Export as PNG
- `POST /api/export/svg` - Export as SVG
- `POST /api/export/xml` - Export as XML

## 🏭 Supported Industries

1. **Manufacturing** - Production workflows, quality control, supply chain
2. **Healthcare** - Patient care processes, medical procedures, compliance
3. **Finance** - Risk assessment, loan processing, compliance workflows

## 🚀 Deployment

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. Build the client: `cd client && npm run build`
2. Set production environment variables
3. Deploy server to your hosting platform
4. Serve client build files

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
CLIENT_URL=your_production_client_url
```

## 🔒 Security Features

- Input validation and sanitization
- CORS configuration
- Helmet security headers
- JWT authentication
- Environment-based configuration
- API rate limiting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`

2. **AI API Errors**
   - Verify API keys are correct
   - Check API rate limits
   - Ensure sufficient credits/quota

3. **Port Conflicts**
   - Frontend: Change port in `client/vite.config.js`
   - Backend: Change PORT in `server/.env`

### Getting Help

- Check the [Issues](issues) page for known problems
- Create a new issue for bug reports
- Refer to the [Documentation](docs/) for detailed guides

## 🎯 Roadmap

- [ ] Additional AI model integrations
- [ ] Real-time collaboration features
- [ ] Advanced process analytics
- [ ] Integration with popular BPM tools
- [ ] Mobile app development

---

**Made with ❤️ from KhanhPN31 aka laza for process optimization and automation**
