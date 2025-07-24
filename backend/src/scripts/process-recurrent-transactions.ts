import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RecurrentTransactionProcessorService } from '../recurrent-transaction-processor/recurrent-transaction-processor.service';
import { parse } from 'date-fns';

async function processRecurrentTransactions() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const processor = app.get(RecurrentTransactionProcessorService);

  try {
    const options: {
      householdId?: string;
      recurrentTransactionId?: string;
      date?: Date;
    } = {};

    // Parse command line arguments
    for (let i = 2; i < process.argv.length; i += 2) {
      const arg = process.argv[i];
      const value = process.argv[i + 1];

      switch (arg) {
        case '--household':
          options.householdId = value;
          break;
        case '--transaction':
          options.recurrentTransactionId = value;
          break;
        case '--date':
          options.date = parse(value, 'yyyy-MM-dd', new Date());
          break;
      }
    }

    console.log('Processing with options:', options);
    await processor.processWithOptions(options);
    console.log('Processing completed successfully');
  } catch (error) {
    console.error('Error during processing:', error);
    process.exit(1);
  }

  await app.close();
  process.exit(0);
}

processRecurrentTransactions();
