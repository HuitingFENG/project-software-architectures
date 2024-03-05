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




## General Presentation
To tackle the Software Architectures Project with a focus on microservices architecture for an order-sharing system, we'll outline a solution using Node.js and Vite, considering microservices principles. This approach involves creating a set of loosely coupled services, each responsible for a specific functionality, communicating over a network to perform functions related to online ordering, payment, and management in a bowling alley context. (In our case, we finish the backend, but we didn't do the frontend part.)

### Steps to launch 
```
git clone https://github.com/HuitingFENG/project-software-architectures.git
```
- install mongodb, postgresql according the OS
![image](/images/2.png)
- create databases and tables for different services
```
brew services list
mongosh
use userService
db.createCollection("users")
use notificationService
db.createCollection("notifications")
use productService
db.createCollection("products")
use sessionService
db.createCollection("sessions")
show dbs
exit
psql postgres
CREATE USER root WITH PASSWORD 'root';
ALTER USER root WITH SUPERUSER;
\q
psql -U root -d postgres
CREATE DATABASE orderservice;
CREATE DATABASE paymentservice;
\l
exit
psql -U root -d paymentservice
\dt
\d Payments
\q
psql -U root -d orderservice
\dt
\d orders
```
![image](/images/3.png)
![image](/images/4.png)
- go to each service's folder to run the service (each service holds a terminal)
```
cd frontend
npm i
npm run dev
```
```
cd ../backend/user-service
npm i
npm run dev
```
```
cd ../product-catalog-service
npm i
npm run dev
```
```
cd ../order-management-service
npm i
npm run dev
```
```
cd ../payment-service
npm i
npm run start:dev
```
```
cd ../notification-service
npm i
npm run dev
```
```
cd ../session-management-service
npm i
npm run dev
```
```
cd ../gateway-service
npm i
npm run start:dev
```
- stay on the gateway-service terminal 
![image](/images/5.png)
- import the postman-collection and the environment files which are located on the root of the project into the Postman. If fail to import environment file then should manually set the environment values.
![image](/images/6.png)
- do the manipulations by checking the videos as follow steps


### Video demo (customers & agents)
```
https://efrei365net-my.sharepoint.com/:f:/g/personal/huiting_feng_efrei_net/EmilXigp4VBLoPTKezLBx4EBExhLeQVi974XcFKZIY2_yg?e=3l6vUx
```
A Session model could have a list of customerIds and a list of orderIds. The session begins when a customer scans the QR code and is marked as active. The session can either be for a single customer or a group of customers who are invited/added on the session by the owner of alley. Each Order would be associated with a customerId and a sessionId, allowing for tracking individual orders within a shared session.

- check video 1: log in with agent1 account + manage products (add + remove + update) products (3 categories: food, beverage, brunch) on the product-catalog + view all databases of backend (users/products/orders/payments/notifications/sessions) + customer1 login and try to view all databases of backend but fail because of the authentification. The registration of users should be done at this step, because the gateway-service don't have implemented the registration router yet, all users' accounts and all products should be prepared before doing the steps on the video 2/3/4/5. The registration of users will be on the user-service (port 3000), but the creation of products will be on the gateway-service (port 3006). add users (3 customers + 2 agents), the qrCode is defined at the agent registration and the qrCode is unique for each alley. For simplicity, we define that the products are the same for all bowling park. 2 agents means 40 qrCode, each agent maintains 1 bowling park where has 20 alleys. one qrCode can have many sessions. one session will have 3 status: vacant, active, closed. If session is active, it means this alley (unique qrCode) is being used by others. Customer needs to change to play on other alley.
```
https://efrei365net-my.sharepoint.com/:v:/g/personal/huiting_feng_efrei_net/EYXF6MLebtZFh4Ut0hyqMzoBOrYpDZenuibyBLEcsOiK3A?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=wGxBXO
```
- check video 2: log in with customer1 account + start a session with qrCode1 + view product catalog of the current bowling park + make 2 orders check bill of this sessions + pay all orders + check situation of bill of this session + check notifications/invoices of this session about all payments + system close the session directly automatically after all payment done and status of this session becomes closed.
```
https://efrei365net-my.sharepoint.com/:v:/g/personal/huiting_feng_efrei_net/ETWi0IpNACJNjq4tBDNmQ-EBkAjHOZblivRuqH8LPdRyzQ?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=gTq48a
```
- check video 3: log in with customer2 account + start a session with qrCode1 + owner customer2 invite customer3 as a group into the same session + customer2 make 2 orders into the session + customer3 make 3 orders + owner customer2 check bill of this session + owner customer2 payed his owner orders + customer3 log in account + customer3 pay his own orders + customer3 check bill of this session + customer3 check notifications/invoices of this session about all payments + system close the session directly automatically after all payment done and status of this session becomes closed.
```
https://efrei365net-my.sharepoint.com/:v:/g/personal/huiting_feng_efrei_net/Eb2osBUSsnFCgbILyISDjG4Byz9ykSfru3xPORWIhGmCDw?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Q3RiIn
```
- check video 4: log in with customer1 account + start a session with qrCode2 + owner customer1 invite customer2 and customer3 as a group into the same session + customer1 make 2 orders + customer2 make 2 orders + customer3 make 2 orders + owner customer1 pay partial payment + check bill of this session + customer2 login + customer2 check the restToPay of this bill + customer2 pay the rest of amount + customer2 check this bill of this session + customer2 check notifications/invoices of this session about all payments + customer1 login his account to check the notifications + system close the session directly automatically after all payment done and status of this session becomes closed.
```

```
- check video 5: others operations on different services. All users can see the whole informations (orders, customers, notifications, payments) of the same session. One session is linked to one group.
```
https://efrei365net-my.sharepoint.com/:v:/g/personal/huiting_feng_efrei_net/EdB0XMIvcZhKhghvM17L4-cBjZp0eBfsKEuy35YEexa_eQ?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=WWx5Y2
```




### Architectural Diagram

<!-- ![image](https://github.com/Incalenn/project-software-architectures/assets/73129627/c58d1ce7-aea4-4024-8725-0ea3db0eb802) -->

![image](/images/1.png)


#### User Interface (UI) Layer (frontend - not finished):
Customer UI: This interface allows customers to select products, place orders, and make payments. It communicates directly with application layer services such as order management and payment service.
Agent UI: Used by catalog managers to manage products and orders. It also interacts with the application layer, specifically with the product catalog service to manage listings.

#### Application Layer (backend - finished):
- User Service (Express, MongoDB): Manages user accounts, authentication, and authorization. 
- Product Catalog Service (Express, MongoDB): Manages the product catalog, including adding, updating, and removing products. Manages the lists of products available to customers and agents. It retrieves and updates information in the product database and interacts with both the customer and agent UIs to display products and manage the catalog.
- Order Management Service (Express, Sequelize, PostgreSQL): Handles order creation, modification, and querying. Central to the application, this service manages the creation, modification, and tracking of orders. It interacts with the Customer UI for order placement, the product database to check availability, and the order database to update or track the status of orders.
- Payment Service (NestJS, Sequelize, PostgreSQL): Integrates with external payment gateways (e.g., Stripe) to process payments. Processes payments by integrating an external payment gateway like Stripe. It handles transactions initiated from the Customer UI and interacts with the order database to update payment statuses.
- Notification Service (Fastify, MongoDB): Sends notifications and updates to users' smartphones and handles email delivery. Sends notifications to customers. It uses the email service to send messages and interacts with the user database to retrieve customer contact details.
- Session Management Service (Fastify, MongoDB): Manages bowling alley sessions and QR code associations.

#### Implementation Considerations
- Define Microservices: Based on the use cases, define the microservices, their APIs, and how they interact.
- Database Design: Each microservice have its own database to ensure loose coupling. Choose a database based on the service's needs. The choice of databases should be driven by the specific needs of each microservice, including data structure, access patterns, scalability requirements, and transactional guarantees. Align with the principles of microservices architecture, we provide each service with its own datastore, which helps to ensure loose coupling and independent scalability.
- Implement Services: For fast prototyping, Express and Fastify are used for microservices that require high performance and minimal overhead. NestJS is recommended for services with complex business logic or those benefiting from its architecture (order-management-service and payment-service) due to its modularity and integration capabilities with other services and databases.
- API Gateway: Implement an API Gateway as the single entry point for the frontend, routing requests to the appropriate microservice.
- Security: Implement JWT for authentication and authorization across services.
- Deployment: Containerize the services using Docker for easy deployment and scalability.
- Security: Measures are implemented at all levels to protect data, ensure secure transactions, and manage user authentication and authorization.
- Scalability: Ensures that services can handle increased loads, which may involve load balancing, horizontal scaling, and efficient database management.
- Payment Gateway (Stripe): Used by the payment service to handle online transactions securely and return the status to the payment service.





## Analyzing Technology Choices
### Tools
-   NodeJS
    - Express
    - Fastify
    - NestJS
-   Postman
-   Vite
-   JWT
-   Docker
-   Stripe
-   Axios
-   MangoDB
-   PostgreSQL
-   Sequelize

### Node.js Frameworks:
- Express: minimalist web framework for Node.js, good for building RESTful APIs. It's lightweight, highly flexible, and has a vast ecosystem of middleware, making it a good choice for the project's backend services.
- Fastify: A fast and low overhead web framework for Node.js. It's designed to be as fast as possible and offers a robust plugin architecture. It can be particularly beneficial for projects requiring high performance and efficiency.
- NestJs: A framework for building efficient, reliable, and scalable server-side applications. It uses TypeScript by default and is heavily inspired by Angular. NestJS provides an out-of-the-box application architecture that allows for easy creation of highly testable, scalable, loosely coupled, and easily maintainable applications.

### Frontend Toolings:
- Vite: A modern frontend build tool that significantly improves the development experience. Vite leverages native ES modules for lightning-fast server start and hot module replacement (HMR). It's compatible with Vue.js, React, Svelte, and vanilla JavaScript, making it a versatile choice for developing the project's frontend aspects, even though the primary focus is on the backend.
- JWT: an open standard for securely transmitting information between parties as a JSON object. This information is digitally signed, allowing it to be verified and trusted. The JWT structure consists of three parts: the header, the payload, and the signature.

### Database
- MongoDB: a NoSQL database that is good for handling large volumes of distributed data. It is flexible and allows for quick iterations, which can be beneficial during the development phase of user-service. It also handles unstructured data well, which is common in user profiles, preferences, etc. 
- Relational Databases (PostgreSQL): Good to ensure ACID (atomicity, consistency, isolation, durability) properties. They are suitable for services where data integrity and complex transactions are critical, such as payment or order services. As for DynamoDB, it is ideal for caching frequently accessed data or for services that require fast reads and writes and can work with a simpler data model.

### Postman Collection for testing
```
https://api.postman.com/collections/33244117-5d00032f-64f8-4563-81f5-c225e81ee130?access_key=PMAT-01HQNR5WFGFG97JEXNPY83F2QZ
```





## References
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