// MongoDB initialization script
db = db.getSiblingDB('auto_bpmn');

// Create collections
db.createCollection('processes');
db.createCollection('questionsets');

// Create indexes for better performance
db.processes.createIndex({ "title": "text", "description": "text" });
db.processes.createIndex({ "industry": 1 });
db.processes.createIndex({ "createdAt": -1 });
db.processes.createIndex({ "isOptimized": 1 });

db.questionsets.createIndex({ "type": 1, "industry": 1 });
db.questionsets.createIndex({ "isActive": 1 });

print('Database initialized successfully!');
