# project-software-architectures
- order sharing system
- M2 SE1 promo 2024

## Contributors
```
Van Alenn PHAM
Senhua LIU
Jonathan EL BAZ
Camille FOUR
Huiting FENG
Hermann HUANG
```

# General Presentation
To tackle the Software Architectures Project with a focus on microservices architecture for an order-sharing system, we'll outline a solution using Node.js and Vite, considering microservices principles. This approach involves creating a set of loosely coupled services, each responsible for a specific functionality, communicating over a network to perform functions related to online ordering, payment, and management in a bowling alley context.

## Architectural Diagram

![image](https://github.com/Incalenn/project-software-architectures/assets/73129627/c58d1ce7-aea4-4024-8725-0ea3db0eb802)


## User Interface (UI) Layer:

Customer UI: This interface allows customers to select products, place orders, and make payments. It communicates directly with application layer services such as order management and payment service.

Agent UI: Used by catalog managers to manage products and orders. It also interacts with the application layer, specifically with the product catalog service to manage listings.

## Application Layer:

Order Management Service: Central to the application, this service manages the creation, modification, and tracking of orders. It interacts with the Customer UI for order placement, the product database to check availability, and the order database to update or track the status of orders.

Product Catalog Service: Manages the lists of products available to customers and agents. It retrieves and updates information in the product database and interacts with both the customer and agent UIs to display products and manage the catalog.

Payment Service: Processes payments by integrating an external payment gateway like Stripe. It handles transactions initiated from the Customer UI and interacts with the order database to update payment statuses.

Notification Service: Sends confirmation emails and notifications to customers. It uses the email service to send messages and interacts with the user database to retrieve customer contact details.

## Database Layer:

User Database: Stores user accounts and profiles, including credentials and contact details used by the notification service to send emails.

Order Database: Maintains records of all orders, used by the order management service to track and update orders.

Product Database: Keeps details of products, accessed by the product catalog service to manage product information.

## External Integrations:

Payment Gateway (Stripe): Used by the payment service to handle online transactions securely and return the status to the payment service.

Email Service (Websocket): Used by the notification service to send emails to customers and agents, acting as an email dispatcher.

## Other Considerations:

Security: Measures are implemented at all levels to protect data, ensure secure transactions, and manage user authentication and authorization.

Scalability: Ensures that services can handle increased loads, which may involve load balancing, horizontal scaling, and efficient database management.

## Proposed Architecture Overview
- User Service (Express, MongoDB): Manages user accounts, authentication, and authorization.
- Product Catalog Service (Express, MongoDB): Manages the product catalog, including adding, updating, and removing products.
- Order Management Service (Express, Sequelize, PostgreSQL): Handles order creation, modification, and querying.
- Payment Service (NestJS, Sequelize, PostgreSQL): Integrates with external payment gateways (e.g., Stripe) to process payments.
- Notification Service (Fastify, MongoDB): Sends notifications and updates to users' smartphones and handles email delivery.
- Session Management Service (Fastify, MongoDB): Manages bowling alley sessions and QR code associations.


## Implementation Steps
- Define Microservices: Based on the use cases, define the microservices, their APIs, and how they interact.
- Database Design: Each microservice should have its own database to ensure loose coupling. Choose a database based on the service's needs. The choice of databases should be driven by the specific needs of each microservice, including data structure, access patterns, scalability requirements, and transactional guarantees. Align with the principles of microservices architecture, we provide each service with its own datastore, which helps to ensure loose coupling and independent scalability.
- Implement Services: For fast prototyping, Express or Fastify can be used for microservices that require high performance and minimal overhead. NestJS is recommended for services with complex business logic or those benefiting from its architecture (e.g., Order Management and Payment Services) due to its modularity and integration capabilities with other services and databases.
- API Gateway: Implement an API Gateway as the single entry point for the frontend, routing requests to the appropriate microservice.
- Inter-service Communication: Use asynchronous messaging (Kafka) for loose coupling between services, especially for notifications and updates.
- Security: Implement JWT for authentication and authorization across services.
- Frontend Mockup: Even though the frontend isn't the focus, a simple mockup using Vite can demonstrate the system's capabilities. Use it to call the backend services via the API Gateway.
- Testing and Documentation: Write unit and integration tests for each service. Document the API using tools like Swagger.
- Deployment: Containerize the services using Docker for easy deployment and scalability. Kubernetes can manage the deployment for larger scale needs.


# Analyzing Technology Choices
## Tools
-   NodeJS
    - Express
    - Fastify
    - NestJS
-   Postman
-   Vite
-   JWT
-   Kafka
-   Docker
-   Kubernetes
-   Stripe
-   Websocket


### Node.js Frameworks:
- Express: minimalist web framework for Node.js, good for building RESTful APIs. It's lightweight, highly flexible, and has a vast ecosystem of middleware, making it a good choice for the project's backend services.
- Fastify: A fast and low overhead web framework for Node.js. It's designed to be as fast as possible and offers a robust plugin architecture. It can be particularly beneficial for projects requiring high performance and efficiency.
- NestJs: A framework for building efficient, reliable, and scalable server-side applications. It uses TypeScript by default and is heavily inspired by Angular. NestJS provides an out-of-the-box application architecture that allows for easy creation of highly testable, scalable, loosely coupled, and easily maintainable applications.

### Frontend Toolings:
- Vite: A modern frontend build tool that significantly improves the development experience. Vite leverages native ES modules for lightning-fast server start and hot module replacement (HMR). It's compatible with Vue.js, React, Svelte, and vanilla JavaScript, making it a versatile choice for developing the project's frontend aspects, even though the primary focus is on the backend.
- JWT: an open standard for securely transmitting information between parties as a JSON object. This information is digitally signed, allowing it to be verified and trusted. The JWT structure consists of three parts: the header, the payload, and the signature.
- Kafka: an open-source stream-processing software platform developed by LinkedIn and donated to the Apache Software Foundation. It's designed to provide a unified, high-throughput, low-latency platform for handling real-time data feeds.

### Database
- MongoDB: a NoSQL database that is good for handling large volumes of distributed data. It is flexible and allows for quick iterations, which can be beneficial during the development phase of user-service. It also handles unstructured data well, which is common in user profiles, preferences, etc. 
- Relational Databases (MySQL/PostgreSQL): Good to ensure ACID (atomicity, consistency, isolation, durability) properties. They are suitable for services where data integrity and complex transactions are critical, such as payment or order services. As for DynamoDB, it is ideal for caching frequently accessed data or for services that require fast reads and writes and can work with a simpler data model.

### Postman Collection for testing
```
https://api.postman.com/collections/33244117-5d00032f-64f8-4563-81f5-c225e81ee130?access_key=PMAT-01HQNR5WFGFG97JEXNPY83F2QZ
```

# Implementation Steps
```
cd backend
pm2 start processes.json
cd .. 
cd frontend
npm i
npm run dev
```



# References
```
https://engcfraposo.medium.com/enhance-modularity-in-nestjs-using-the-strategy-pattern-a2863b82a1dd
```
```
https://medium.com/@wteja/mastering-dependency-injection-in-nestjs-61795d0b8fb7
```
```
https://moaw.dev/workshop/?src=gh%3Aazure-samples%2Fnodejs-microservices%2Fmain%2Fdocs%2F&step=6#
```
```
https://github.com/Azure-Samples/nodejs-microservices
```