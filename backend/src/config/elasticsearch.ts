import { Client } from '@elastic/elasticsearch';
import { env } from './env';

let client: Client | null = null;

export async function connectElasticsearch(): Promise<Client> {
  if (client) return client;

  client = new Client({
    node: env.ELASTICSEARCH_URL,
    requestTimeout: 10_000,
  });

  // Real runtime verification — ping the cluster before declaring connected
  const ping = await client.ping();
  if (!ping) {
    client = null;
    throw new Error('Elasticsearch ping failed');
  }

  // eslint-disable-next-line no-console
  console.log('✅ Elasticsearch connected at', env.ELASTICSEARCH_URL);

  // Create the reports index if it doesn't exist yet
  const indexName = 'inspection-reports';
  const exists = await client.indices.exists({ index: indexName });
  if (!exists) {
    await client.indices.create({
      index: indexName,
      mappings: {
        properties: {
          subjectId: { type: 'keyword' },
          subjectKind: { type: 'keyword' },
          subjectLabel: { type: 'text' },
          status: { type: 'keyword' },
          score: { type: 'integer' },
          summary: { type: 'text' },
          aiProvider: { type: 'keyword' },
          createdAt: { type: 'date' },
        },
      },
    });
    // eslint-disable-next-line no-console
    console.log(`📊 Elasticsearch index "${indexName}" created`);
  }

  return client;
}

export function getElasticsearch(): Client {
  if (!client) throw new Error('Elasticsearch not connected. Call connectElasticsearch() first.');
  return client;
}
