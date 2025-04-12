// Utility functions
function logMessage(logId, message) {
    const log = document.getElementById(logId);
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `[${timestamp}] ${message}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

function clearLog(logId) {
    const log = document.getElementById(logId);
    log.innerHTML = '';
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Generate a random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 1. Producer-Consumer Problem
class ProducerConsumerSimulation {
    constructor() {
        this.buffer = [];
        this.bufferSize = 0;
        this.producers = [];
        this.consumers = [];
        this.producerSpeed = 1000;
        this.consumerSpeed = 1500;
        this.running = false;
        this.nextItemId = 1;
        
        // UI Elements
        this.bufferContainer = document.getElementById('buffer-container');
        this.producersContainer = document.getElementById('producers-container');
        this.consumersContainer = document.getElementById('consumers-container');
        
        // Setup controls
        document.getElementById('start-producer-consumer').addEventListener('click', () => this.start());
        document.getElementById('stop-producer-consumer').addEventListener('click', () => this.stop());
    }
    
    setup() {
        this.bufferSize = parseInt(document.getElementById('buffer-size').value);
        const producerCount = parseInt(document.getElementById('producer-count').value);
        const consumerCount = parseInt(document.getElementById('consumer-count').value);
        this.producerSpeed = parseInt(document.getElementById('producer-speed').value);
        this.consumerSpeed = parseInt(document.getElementById('consumer-speed').value);
        
        // Clear previous state
        this.buffer = [];
        this.producers = [];
        this.consumers = [];
        this.bufferContainer.innerHTML = '';
        this.producersContainer.innerHTML = '';
        this.consumersContainer.innerHTML = '';
        this.nextItemId = 1;
        
        // Create buffer UI
        for (let i = 0; i < this.bufferSize; i++) {
            const bufferItem = document.createElement('div');
            bufferItem.className = 'buffer-item';
            bufferItem.id = `buffer-item-${i}`;
            this.bufferContainer.appendChild(bufferItem);
        }
        
        // Create producers
        for (let i = 0; i < producerCount; i++) {
            const producer = document.createElement('div');
            producer.className = 'agent producer';
            producer.id = `producer-${i}`;
            producer.textContent = `Producer ${i+1}`;
            this.producersContainer.appendChild(producer);
            this.producers.push({ id: i, element: producer });
        }
        
        // Create consumers
        for (let i = 0; i < consumerCount; i++) {
            const consumer = document.createElement('div');
            consumer.className = 'agent consumer';
            consumer.id = `consumer-${i}`;
            consumer.textContent = `Consumer ${i+1}`;
            this.consumersContainer.appendChild(consumer);
            this.consumers.push({ id: i, element: consumer });
        }
        
        clearLog('producer-consumer-log');
        logMessage('producer-consumer-log', 'Simulation set up.');
    }
    
    async produce(producerId) {
        if (!this.running) return;
        
        const producer = this.producers.find(p => p.id === producerId);
        if (!producer) return;
        
        // Activate producer
        producer.element.classList.add('active');
        
        // Check if buffer is full
        if (this.buffer.length >= this.bufferSize) {
            logMessage('producer-consumer-log', `Producer ${producerId+1} waiting - buffer full`);
            producer.element.classList.remove('active');
            
            // Try again after a delay if simulation is still running
            if (this.running) {
                await sleep(this.producerSpeed / 2);
                this.produce(producerId);
            }
            return;
        }
        
        // Produce item
        await sleep(this.producerSpeed / 2);
        const item = { id: this.nextItemId++ };
        this.buffer.push(item);
        
        // Update buffer UI
        const bufferIndex = this.buffer.length - 1;
        const bufferItem = document.getElementById(`buffer-item-${bufferIndex}`);
        if (bufferItem) {
            bufferItem.textContent = item.id;
            bufferItem.classList.add('filled');
        }
        
        logMessage('producer-consumer-log', `Producer ${producerId+1} produced item ${item.id}`);
        
        // Deactivate producer
        producer.element.classList.remove('active');
        
        // Schedule next production if simulation is running
        if (this.running) {
            const nextProduceTime = randomInt(this.producerSpeed * 0.8, this.producerSpeed * 1.2);
            setTimeout(() => this.produce(producerId), nextProduceTime);
        }
    }
    
    async consume(consumerId) {
        if (!this.running) return;
        
        const consumer = this.consumers.find(c => c.id === consumerId);
        if (!consumer) return;
        
        // Activate consumer
        consumer.element.classList.add('active');
        
        // Check if buffer is empty
        if (this.buffer.length === 0) {
            logMessage('producer-consumer-log', `Consumer ${consumerId+1} waiting - buffer empty`);
            consumer.element.classList.remove('active');
            
            // Try again after a delay if simulation is still running
            if (this.running) {
                await sleep(this.consumerSpeed / 2);
                this.consume(consumerId);
            }
            return;
        }
        
        // Consume item
        await sleep(this.consumerSpeed / 2);
        const item = this.buffer.shift();
        
        // Update buffer UI
        for (let i = 0; i < this.bufferSize; i++) {
            const bufferItem = document.getElementById(`buffer-item-${i}`);
            if (i < this.buffer.length) {
                bufferItem.textContent = this.buffer[i].id;
                bufferItem.classList.add('filled');
            } else {
                bufferItem.textContent = '';
                bufferItem.classList.remove('filled');
            }
        }
        
        logMessage('producer-consumer-log', `Consumer ${consumerId+1} consumed item ${item.id}`);
        
        // Deactivate consumer
        consumer.element.classList.remove('active');
        
        // Schedule next consumption if simulation is running
        if (this.running) {
            const nextConsumeTime = randomInt(this.consumerSpeed * 0.8, this.consumerSpeed * 1.2);
            setTimeout(() => this.consume(consumerId), nextConsumeTime);
        }
    }
    
    start() {
        if (this.running) return;
        
        this.running = true;
        this.setup();
        
        document.getElementById('start-producer-consumer').disabled = true;
        document.getElementById('stop-producer-consumer').disabled = false;
        
        logMessage('producer-consumer-log', 'Simulation started.');
        
        // Start all producers
        this.producers.forEach(producer => {
            const startDelay = randomInt(0, this.producerSpeed / 2);
            setTimeout(() => this.produce(producer.id), startDelay);
        });
        
        // Start all consumers
        this.consumers.forEach(consumer => {
            const startDelay = randomInt(0, this.consumerSpeed / 2);
            setTimeout(() => this.consume(consumer.id), startDelay);
        });
    }
    
    stop() {
        this.running = false;
        
        document.getElementById('start-producer-consumer').disabled = false;
        document.getElementById('stop-producer-consumer').disabled = true;
        
        logMessage('producer-consumer-log', 'Simulation stopped.');
        
        // Deactivate all producers and consumers
        this.producers.forEach(producer => producer.element.classList.remove('active'));
        this.consumers.forEach(consumer => consumer.element.classList.remove('active'));
    }
}

// 2. Readers-Writers Problem
class ReadersWritersSimulation {
    constructor() {
        this.readers = [];
        this.writers = [];
        this.readerSpeed = 1000;
        this.writerSpeed = 2000;
        this.running = false;
        this.resourceValue = "Initial Value";
        this.activeReaders = 0;
        this.activeWriter = null;
        this.waitingReaders = [];
        this.waitingWriters = [];
        this.priority = "reader";
        
        // UI Elements
        this.resourceContainer = document.getElementById('resource-container');
        this.resourceValueElement = document.getElementById('resource-value');
        this.accessStatusElement = document.getElementById('access-status');
        this.readersContainer = document.getElementById('readers-container');
        this.writersContainer = document.getElementById('writers-container');
        
        // Setup controls
        document.getElementById('start-readers-writers').addEventListener('click', () => this.start());
        document.getElementById('stop-readers-writers').addEventListener('click', () => this.stop());
    }
    
    setup() {
        const readerCount = parseInt(document.getElementById('reader-count').value);
        const writerCount = parseInt(document.getElementById('writer-count').value);
        this.readerSpeed = parseInt(document.getElementById('reader-speed').value);
        this.writerSpeed = parseInt(document.getElementById('writer-speed').value);
        this.priority = document.getElementById('reader-priority').value;
        
        // Clear previous state
        this.readers = [];
        this.writers = [];
        this.readersContainer.innerHTML = '';
        this.writersContainer.innerHTML = '';
        this.activeReaders = 0;
        this.activeWriter = null;
        this.waitingReaders = [];
        this.waitingWriters = [];
        this.resourceValue = "Initial Value";
        this.resourceValueElement.textContent = this.resourceValue;
        this.accessStatusElement.textContent = "Not in use";
        this.resourceContainer.className = "resource";
        
        // Create readers
        for (let i = 0; i < readerCount; i++) {
            const reader = document.createElement('div');
            reader.className = 'agent reader';
            reader.id = `reader-${i}`;
            reader.textContent = `Reader ${i+1}`;
            this.readersContainer.appendChild(reader);
            this.readers.push({ id: i, element: reader, status: 'idle' });
        }
        
        // Create writers
        for (let i = 0; i < writerCount; i++) {
            const writer = document.createElement('div');
            writer.className = 'agent writer';
            writer.id = `writer-${i}`;
            writer.textContent = `Writer ${i+1}`;
            this.writersContainer.appendChild(writer);
            this.writers.push({ id: i, element: writer, status: 'idle' });
        }
        
        clearLog('readers-writers-log');
        logMessage('readers-writers-log', 'Simulation set up.');
    }
    
    async startReading(readerId) {
        if (!this.running) return;
        
        const reader = this.readers.find(r => r.id === readerId);
        if (!reader) return;
        
        // Check if we can read
        if (this.activeWriter !== null || (this.priority === 'writer' && this.waitingWriters.length > 0)) {
            // Cannot read now, must wait
            if (reader.status !== 'waiting') {
                reader.status = 'waiting';
                reader.element.textContent = `Reader ${readerId+1} (waiting)`;
                this.waitingReaders.push(readerId);
                logMessage('readers-writers-log', `Reader ${readerId+1} waiting to access resource`);
            }
            
            // Try again after a delay if simulation is still running
            if (this.running) {
                await sleep(this.readerSpeed / 2);
                this.startReading(readerId);
            }
            return;
        }
        
        // Start reading
        reader.status = 'reading';
        reader.element.classList.add('active');
        reader.element.textContent = `Reader ${readerId+1} (reading)`;
        this.activeReaders++;
        
        // Update the resource UI
        this.resourceContainer.classList.add('reading');
        this.accessStatusElement.textContent = `Being read by ${this.activeReaders} reader(s)`;
        
        // Remove from waiting list if applicable
        const waitingIndex = this.waitingReaders.indexOf(readerId);
        if (waitingIndex !== -1) {
            this.waitingReaders.splice(waitingIndex, 1);
        }
        
        logMessage('readers-writers-log', `Reader ${readerId+1} started reading. Value: "${this.resourceValue}"`);
        
        // Read for a while
        await sleep(this.readerSpeed);
        
        // Finish reading
        if (this.running && reader.status === 'reading') {
            this.activeReaders--;
            reader.status = 'idle';
            reader.element.classList.remove('active');
            reader.element.textContent = `Reader ${readerId+1}`;
            
            logMessage('readers-writers-log', `Reader ${readerId+1} finished reading`);
            
            // Update the resource UI
            if (this.activeReaders === 0) {
                this.resourceContainer.classList.remove('reading');
                this.accessStatusElement.textContent = "Not in use";
                
                // Allow waiting writers to proceed if there are any
                if (this.waitingWriters.length > 0 && this.running) {
                    const nextWriterId = this.waitingWriters[0];
                    const nextWriter = this.writers.find(w => w.id === nextWriterId);
                    if (nextWriter && nextWriter.status === 'waiting') {
                        this.startWriting(nextWriterId);
                    }
                }
            } else {
                this.accessStatusElement.textContent = `Being read by ${this.activeReaders} reader(s)`;
            }
        }
        
        // Schedule next reading if simulation is running
        if (this.running) {
            const nextReadTime = randomInt(this.readerSpeed * 0.8, this.readerSpeed * 1.2);
            setTimeout(() => this.startReading(readerId), nextReadTime);
        }
    }
    
    async startWriting(writerId) {
        if (!this.running) return;
        
        const writer = this.writers.find(w => w.id === writerId);
        if (!writer) return;
        
        // Check if we can write
        if (this.activeReaders > 0 || this.activeWriter !== null || 
            (this.priority === 'reader' && this.waitingReaders.length > 0)) {
            // Cannot write now, must wait
            if (writer.status !== 'waiting') {
                writer.status = 'waiting';
                writer.element.textContent = `Writer ${writerId+1} (waiting)`;
                if (!this.waitingWriters.includes(writerId)) {
                    this.waitingWriters.push(writerId);
                }
                logMessage('readers-writers-log', `Writer ${writerId+1} waiting to access resource`);
            }
            
            // Try again after a delay if simulation is still running
            if (this.running) {
                await sleep(this.writerSpeed / 2);
                this.startWriting(writerId);
            }
            return;
        }
        
        // Start writing
        writer.status = 'writing';
        writer.element.classList.add('active');
        writer.element.textContent = `Writer ${writerId+1} (writing)`;
        this.activeWriter = writerId;
        
        // Update the resource UI
        this.resourceContainer.classList.add('writing');
        this.resourceContainer.classList.remove('reading');
        this.accessStatusElement.textContent = `Being written by Writer ${writerId+1}`;
        
        // Remove from waiting list if applicable
        const waitingIndex = this.waitingWriters.indexOf(writerId);
        if (waitingIndex !== -1) {
            this.waitingWriters.splice(waitingIndex, 1);
        }
        
        logMessage('readers-writers-log', `Writer ${writerId+1} started writing`);
        
        // Write for a while
        await sleep(this.writerSpeed);
        
        // Finish writing with a new value
        if (this.running && writer.status === 'writing') {
            const newValue = `Value written by Writer ${writerId+1} at ${new Date().toLocaleTimeString()}`;
            this.resourceValue = newValue;
            this.resourceValueElement.textContent = newValue;
            
            writer.status = 'idle';
            writer.element.classList.remove('active');
            writer.element.textContent = `Writer ${writerId+1}`;
            this.activeWriter = null;
            
            // Update the resource UI
            this.resourceContainer.classList.remove('writing');
            this.accessStatusElement.textContent = "Not in use";
            
            logMessage('readers-writers-log', `Writer ${writerId+1} finished writing. New value: "${newValue}"`);
            
            // Allow waiting readers or writers to proceed based on priority
            if (this.running) {
                if (this.priority === 'reader' && this.waitingReaders.length > 0) {
                    // Let all waiting readers proceed
                    [...this.waitingReaders].forEach(readerId => {
                        const reader = this.readers.find(r => r.id === readerId);
                        if (reader && reader.status === 'waiting') {
                            this.startReading(readerId);
                        }
                    });
                } else if (this.waitingWriters.length > 0) {
                    // Let next writer proceed
                    const nextWriterId = this.waitingWriters[0];
                    const nextWriter = this.writers.find(w => w.id === nextWriterId);
                    if (nextWriter && nextWriter.status === 'waiting') {
                        this.startWriting(nextWriterId);
                    }
                } else if (this.waitingReaders.length > 0) {
                    // Let all waiting readers proceed if no writers
                    [...this.waitingReaders].forEach(readerId => {
                        const reader = this.readers.find(r => r.id === readerId);
                        if (reader && reader.status === 'waiting') {
                            this.startReading(readerId);
                        }
                    });
                }
            }
        }
        
        // Schedule next writing if simulation is running
        if (this.running) {
            const nextWriteTime = randomInt(this.writerSpeed * 0.8, this.writerSpeed * 1.2);
            setTimeout(() => this.startWriting(writerId), nextWriteTime);
        }
    }

start() {
    if (this.running) return;
    
    this.running = true;
    this.setup();
    
    document.getElementById('start-readers-writers').disabled = true;
    document.getElementById('stop-readers-writers').disabled = false;
    
    logMessage('readers-writers-log', 'Simulation started.');
    
    // Start all readers
    this.readers.forEach(reader => {
        const startDelay = randomInt(0, this.readerSpeed);
        setTimeout(() => this.startReading(reader.id), startDelay);
    });
    
    // Start all writers
    this.writers.forEach(writer => {
        const startDelay = randomInt(0, this.writerSpeed);
        setTimeout(() => this.startWriting(writer.id), startDelay);
    });
}

stop() {
    this.running = false;
    
    document.getElementById('start-readers-writers').disabled = false;
    document.getElementById('stop-readers-writers').disabled = true;
    
    logMessage('readers-writers-log', 'Simulation stopped.');
    
    // Reset reader and writer states
    this.readers.forEach(reader => {
        reader.status = 'idle';
        reader.element.classList.remove('active');
        reader.element.textContent = `Reader ${reader.id+1}`;
    });
    
    this.writers.forEach(writer => {
        writer.status = 'idle';
        writer.element.classList.remove('active');
        writer.element.textContent = `Writer ${writer.id+1}`;
    });
    
    // Reset resource
    this.resourceContainer.classList.remove('reading', 'writing');
    this.accessStatusElement.textContent = "Not in use";
    this.activeReaders = 0;
    this.activeWriter = null;
    this.waitingReaders = [];
    this.waitingWriters = [];
}
}

// 3. Dining Philosophers Problem
class DiningPhilosophersSimulation {
constructor() {
    this.philosophers = [];
    this.forks = [];
    this.philosopherCount = 5;
    this.thinkingTime = 1500;
    this.eatingTime = 2000;
    this.running = false;
    this.deadlockPrevention = 'none';
    
    // UI Elements
    this.tableContainer = document.getElementById('table');
    this.philosophersContainer = document.getElementById('philosophers-container');
    
    // Setup controls
    document.getElementById('start-dining-philosophers').addEventListener('click', () => this.start());
    document.getElementById('stop-dining-philosophers').addEventListener('click', () => this.stop());
}

setup() {
    this.philosopherCount = parseInt(document.getElementById('philosopher-count').value);
    this.thinkingTime = parseInt(document.getElementById('thinking-time').value);
    this.eatingTime = parseInt(document.getElementById('eating-time').value);
    this.deadlockPrevention = document.getElementById('deadlock-prevention').value;
    
    // Clear previous state
    this.philosophers = [];
    this.forks = [];
    this.tableContainer.innerHTML = '';
    this.philosophersContainer.innerHTML = '';
    
    // Create forks
    for (let i = 0; i < this.philosopherCount; i++) {
        const fork = document.createElement('div');
        fork.className = 'fork';
        fork.id = `fork-${i}`;
        
        // Position fork around the table
        const angle = (i / this.philosopherCount) * 2 * Math.PI;
        const tableRadius = 80; // Adjust based on table size
        const forkX = tableRadius * Math.cos(angle);
        const forkY = tableRadius * Math.sin(angle);
        
        fork.style.left = `${100 + forkX}px`;
        fork.style.top = `${100 + forkY}px`;
        fork.style.transform = `rotate(${angle + Math.PI/2}rad) translateX(-5px)`;
        
        this.tableContainer.appendChild(fork);
        this.forks.push({ id: i, element: fork, inUse: false });
    }
    
    // Create philosopher status indicators
    for (let i = 0; i < this.philosopherCount; i++) {
        const philosopherStatus = document.createElement('div');
        philosopherStatus.className = 'philosopher-status thinking';
        philosopherStatus.id = `philosopher-status-${i}`;
        philosopherStatus.textContent = `Philosopher ${i+1}\nthinking`;
        
        this.philosophersContainer.appendChild(philosopherStatus);
        
        this.philosophers.push({
            id: i,
            status: 'thinking',
            element: philosopherStatus,
            leftFork: i,
            rightFork: (i + 1) % this.philosopherCount
        });
    }
    
    clearLog('dining-philosophers-log');
    logMessage('dining-philosophers-log', 'Simulation set up.');
}

updatePhilosopherStatus(philosopherId, status) {
    const philosopher = this.philosophers.find(p => p.id === philosopherId);
    if (!philosopher) return;
    
    philosopher.status = status;
    philosopher.element.className = `philosopher-status ${status}`;
    philosopher.element.textContent = `Philosopher ${philosopherId+1}\n${status}`;
}

updateForkStatus(forkId, inUse) {
    const fork = this.forks.find(f => f.id === forkId);
    if (!fork) return;
    
    fork.inUse = inUse;
    if (inUse) {
        fork.element.classList.add('in-use');
    } else {
        fork.element.classList.remove('in-use');
    }
}

async pickUpForks(philosopherId) {
    const philosopher = this.philosophers.find(p => p.id === philosopherId);
    if (!philosopher) return false;
    
    let leftForkId = philosopher.leftFork;
    let rightForkId = philosopher.rightFork;
    
    // Resource hierarchy solution to prevent deadlock
    if (this.deadlockPrevention === 'resource-hierarchy') {
        // Always pick up the lower-numbered fork first
        if (leftForkId > rightForkId) {
            [leftForkId, rightForkId] = [rightForkId, leftForkId];
        }
    }
    
    // Arbitrator solution (only allow N-1 philosophers to eat simultaneously)
    if (this.deadlockPrevention === 'arbitrator') {
        // Check if we'd exceed the safe number of philosophers eating
        const eatingCount = this.philosophers.filter(p => p.status === 'eating').length;
        if (eatingCount >= this.philosopherCount - 1) {
            return false;
        }
    }
    
    // Try to pick up the first fork
    const firstFork = this.forks.find(f => f.id === leftForkId);
    if (!firstFork || firstFork.inUse) return false;
    
    this.updateForkStatus(leftForkId, true);
    logMessage('dining-philosophers-log', `Philosopher ${philosopherId+1} picked up fork ${leftForkId+1}`);
    
    // Try to pick up the second fork
    const secondFork = this.forks.find(f => f.id === rightForkId);
    if (!secondFork || secondFork.inUse) {
        // Have to put down the first fork
        this.updateForkStatus(leftForkId, false);
        logMessage('dining-philosophers-log', `Philosopher ${philosopherId+1} had to put down fork ${leftForkId+1}`);
        return false;
    }
    
    this.updateForkStatus(rightForkId, true);
    logMessage('dining-philosophers-log', `Philosopher ${philosopherId+1} picked up fork ${rightForkId+1}`);
    
    return true;
}

putDownForks(philosopherId) {
    const philosopher = this.philosophers.find(p => p.id === philosopherId);
    if (!philosopher) return;
    
    this.updateForkStatus(philosopher.leftFork, false);
    this.updateForkStatus(philosopher.rightFork, false);
    
    logMessage('dining-philosophers-log', `Philosopher ${philosopherId+1} put down both forks`);
}

async philosopherCycle(philosopherId) {
    if (!this.running) return;
    
    const philosopher = this.philosophers.find(p => p.id === philosopherId);
    if (!philosopher) return;
    
    // Thinking
    this.updatePhilosopherStatus(philosopherId, 'thinking');
    logMessage('dining-philosophers-log', `Philosopher ${philosopherId+1} is thinking`);
    await sleep(this.thinkingTime);
    
    if (!this.running) return;
    
    // Hungry
    this.updatePhilosopherStatus(philosopherId, 'hungry');
    logMessage('dining-philosophers-log', `Philosopher ${philosopherId+1} is hungry`);
    
    // Try to pick up forks
    let success = false;
    while (this.running && !success) {
        success = await this.pickUpForks(philosopherId);
        if (!success && this.running) {
            await sleep(500); // Wait a bit before trying again
        }
    }
    
    if (!this.running) {
        // Clean up if simulation stopped
        this.putDownForks(philosopherId);
        return;
    }
    
    // Eating
    this.updatePhilosopherStatus(philosopherId, 'eating');
    logMessage('dining-philosophers-log', `Philosopher ${philosopherId+1} is eating`);
    await sleep(this.eatingTime);
    
    if (!this.running) {
        // Clean up if simulation stopped
        this.putDownForks(philosopherId);
        return;
    }
    
    // Put down forks
    this.putDownForks(philosopherId);
    
    // Start the cycle again
    if (this.running) {
        this.philosopherCycle(philosopherId);
    }
}

start() {
    if (this.running) return;
    
    this.running = true;
    this.setup();
    
    document.getElementById('start-dining-philosophers').disabled = true;
    document.getElementById('stop-dining-philosophers').disabled = false;
    
    logMessage('dining-philosophers-log', 'Simulation started.');
    
    // Start all philosophers' cycles with a random delay
    this.philosophers.forEach(philosopher => {
        const startDelay = randomInt(0, 1000);
        setTimeout(() => this.philosopherCycle(philosopher.id), startDelay);
    });
}

stop() {
    this.running = false;
    
    document.getElementById('start-dining-philosophers').disabled = false;
    document.getElementById('stop-dining-philosophers').disabled = true;
    
    logMessage('dining-philosophers-log', 'Simulation stopped.');
    
    // Reset all forks
    this.forks.forEach(fork => {
        fork.inUse = false;
        fork.element.classList.remove('in-use');
    });
    
    // Reset all philosophers
    this.philosophers.forEach(philosopher => {
        this.updatePhilosopherStatus(philosopher.id, 'thinking');
    });
}
}

// Initialize all simulations when the page loads
document.addEventListener('DOMContentLoaded', () => {
const producerConsumer = new ProducerConsumerSimulation();
const readersWriters = new ReadersWritersSimulation();
const diningPhilosophers = new DiningPhilosophersSimulation();
});