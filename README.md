# VitaBot - AI-Powered Vitamins Chatbot 🤖💊

An intelligent conversational AI system designed specifically for a vitamins and supplements retail website. VitaBot provides personalized vitamin recommendations, health information, customer support, and order assistance through an engaging chat interface.

## ✨ Features

### 🤖 Intelligent Chatbot
- **Natural Language Processing**: Advanced intent recognition and entity extraction
- **Personalized Recommendations**: AI-driven vitamin suggestions based on health goals
- **Health Information**: Comprehensive database of vitamin and supplement knowledge
- **Real-time Chat**: WebSocket-powered instant messaging with typing indicators

### 🏥 Health & Wellness
- **Health Assessment Quiz**: Interactive questionnaire for personalized recommendations
- **Vitamin Knowledge Base**: Detailed information about vitamins, minerals, and supplements
- **Dosage Guidance**: Safe usage instructions and daily value recommendations
- **Drug Interaction Warnings**: Safety information and precautions

### 🛒 E-commerce Integration
- **Product Search**: Smart product discovery and filtering
- **Order Tracking**: Real-time order status updates
- **Shopping Cart Integration**: Seamless add-to-cart functionality
- **Customer Profiles**: Personalized health profiles and preferences

### 📊 Analytics & Admin
- **Conversation Analytics**: Detailed insights into user interactions
- **Performance Metrics**: Customer satisfaction and engagement tracking
- **Admin Dashboard**: Comprehensive management interface
- **A/B Testing**: Continuous improvement through data analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MongoDB 4.4+
- OpenAI API key (for AI functionality)

### Installation

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd chatbot
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/vitamins_chatbot
   
   # AI Service (OpenAI)
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   
   # Security
   JWT_SECRET=your_jwt_secret_key_here
   ADMIN_KEY=your_admin_key_here
   ```

3. **Database Setup**
   ```bash
   # Start MongoDB service
   # Windows: net start MongoDB
   # macOS: brew services start mongodb-community
   # Linux: sudo systemctl start mongod
   
   # Seed the database with sample data
   node scripts/seedData.js
   ```

4. **Start the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Access the Application**
   - **Main Application**: http://localhost:3000
   - **Health Check**: http://localhost:3000/health
   - **API Documentation**: http://localhost:3000/api/

## 🏗️ Architecture

### Backend Structure
```
├── server.js              # Main server entry point
├── config/
│   └── database.js        # MongoDB connection
├── models/
│   └── index.js           # Database schemas
├── services/
│   ├── ChatbotService.js  # AI conversation engine
│   └── SocketHandler.js   # WebSocket management
├── routes/
│   ├── chat.js            # Chat API endpoints
│   ├── admin.js           # Admin management
│   └── analytics.js       # Analytics endpoints
└── scripts/
    └── seedData.js        # Database seeding
```

### Frontend Structure
```
public/
├── index.html             # Main application page
├── styles/
│   └── main.css          # Complete styling system
└── js/
    ├── chatbot.js        # Chat interface logic
    └── main.js           # General app functionality
```

## 🔌 API Endpoints

### Chat API
```http
POST   /api/chat/message                    # Send message to chatbot
GET    /api/chat/conversation/:sessionId    # Get conversation history
POST   /api/chat/feedback                   # Submit message feedback
POST   /api/chat/clear/:sessionId          # Clear conversation
GET    /api/chat/products/search           # Search products
GET    /api/chat/products/recommendations  # Get recommendations
POST   /api/chat/customer/profile          # Update customer profile
```

### Admin API
```http
GET    /api/admin/dashboard                 # Dashboard overview
GET    /api/admin/conversations            # List conversations
GET    /api/admin/conversations/:sessionId # Conversation details
POST   /api/admin/products                 # Create product
GET    /api/admin/products                 # List products
PUT    /api/admin/products/:id            # Update product
DELETE /api/admin/products/:id            # Delete product
GET    /api/admin/customers               # List customers
POST   /api/admin/knowledge-base          # Create knowledge entry
GET    /api/admin/knowledge-base          # List knowledge entries
PUT    /api/admin/knowledge-base/:id      # Update knowledge entry
```

### Analytics API
```http
GET    /api/analytics/overview            # Basic analytics
GET    /api/analytics/intents             # Intent distribution
GET    /api/analytics/satisfaction       # Customer satisfaction
GET    /api/analytics/popular-products   # Popular product mentions
GET    /api/analytics/daily-trends       # Daily conversation trends
GET    /api/analytics/conversation-flow  # Conversation flow analysis
```

## 💬 Chatbot Capabilities

### Intent Recognition
- **Product Recommendations**: Personalized vitamin suggestions
- **Health Information**: Detailed vitamin and supplement education
- **Order Tracking**: Real-time order status and delivery updates
- **Product Information**: Detailed product specifications and benefits
- **Pricing Information**: Current pricing and promotions
- **Availability Checking**: Stock status and restock notifications
- **General Support**: Customer service and technical assistance

### Smart Features
- **Context Awareness**: Remembers conversation history and preferences
- **Entity Extraction**: Identifies vitamins, health goals, and personal info
- **Personalization**: Adapts recommendations based on user profile
- **Multi-turn Conversations**: Handles complex, multi-step interactions
- **Fallback Handling**: Graceful error recovery and human handoff

## 📱 Frontend Features

### Chat Interface
- **Modern Design**: Clean, responsive Material Design-inspired UI
- **Real-time Messaging**: Instant message delivery with typing indicators
- **Quick Actions**: Pre-defined buttons for common queries
- **Message History**: Persistent conversation storage
- **Rich Media**: Support for images, links, and formatted text
- **Accessibility**: Full keyboard navigation and screen reader support

### Health Assessment
- **Interactive Quiz**: Step-by-step health goal assessment
- **Progress Tracking**: Visual progress indicators
- **Personalized Results**: Customized recommendations based on responses
- **Integration**: Seamless handoff to chatbot for follow-up questions

### Mobile Optimization
- **Responsive Design**: Works perfectly on all device sizes
- **Touch-Friendly**: Optimized for mobile interaction
- **Performance**: Fast loading and smooth animations
- **Offline Support**: Basic functionality works without internet

## 🔒 Security Features

- **Rate Limiting**: Protection against spam and abuse
- **Input Sanitization**: XSS and injection attack prevention
- **CORS Configuration**: Secure cross-origin resource sharing
- **Environment Secrets**: Secure API key and token management
- **Data Validation**: Comprehensive input validation and sanitization

## 📊 Analytics & Monitoring

### Conversation Analytics
- **Intent Distribution**: Most common user intents and patterns
- **Customer Satisfaction**: Ratings and feedback analysis
- **Session Metrics**: Duration, message count, and engagement
- **Popular Products**: Most mentioned and recommended items
- **Conversion Tracking**: Chat-to-purchase funnel analysis

### Performance Monitoring
- **Real-time Metrics**: Active connections and response times
- **Error Tracking**: Automated error detection and alerting
- **Usage Patterns**: Peak hours and user behavior analysis
- **A/B Testing**: Experiment framework for continuous improvement

## 🛠️ Development

### Adding New Intents
1. Update `ChatbotService.js` intent classifier training data
2. Add handler method in `ChatbotService.js`
3. Update intent routing in `generateResponse` method
4. Test with sample conversations

### Adding New Products
1. Use admin API or directly insert into MongoDB
2. Ensure proper categorization and tagging
3. Update knowledge base with related information
4. Test recommendation algorithms

### Extending Analytics
1. Add new metrics to `Analytics` model schema
2. Create aggregation queries in `routes/analytics.js`
3. Update admin dashboard to display new metrics
4. Add visualization components if needed

## 🚀 Deployment

### Production Configuration
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://your-production-server:27017/vitamins_chatbot
OPENAI_API_KEY=your_production_openai_key
JWT_SECRET=your_secure_jwt_secret
ADMIN_KEY=your_secure_admin_key
```

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- **Reverse Proxy**: Nginx or Apache for SSL termination
- **Process Manager**: PM2 for production process management
- **Database**: MongoDB Atlas or self-hosted MongoDB cluster
- **CDN**: CloudFlare or AWS CloudFront for static assets
- **Monitoring**: New Relic, DataDog, or similar APM tools

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow ESLint configuration
2. **Testing**: Write unit tests for new features
3. **Documentation**: Update README and inline comments
4. **Git Workflow**: Use feature branches and pull requests

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Issues**: Create a GitHub issue
- **Email**: support@vitastore.com
- **Documentation**: See `/docs` folder for detailed guides

## 🙏 Acknowledgments

- **OpenAI**: For providing the GPT API that powers our AI conversations
- **MongoDB**: For the flexible document database
- **Socket.io**: For real-time communication capabilities
- **Express.js**: For the robust web framework
- **Natural**: For natural language processing utilities

---

Built with ❤️ for better health and wellness through AI-powered nutrition guidance.