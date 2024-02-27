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

Payment Gateway (like Stripe): Used by the payment service to handle online transactions securely and return the status to the payment service.

Email Service: Used by the notification service to send emails to customers and agents, acting as an email dispatcher.

## Other Considerations:

Security: Measures are implemented at all levels to protect data, ensure secure transactions, and manage user authentication and authorization.

Scalability: Ensures that services can handle increased loads, which may involve load balancing, horizontal scaling, and efficient database management.


## Tools
-   NodeJS
    - Express
    - Fastify
    - NestJS
-   Postman

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