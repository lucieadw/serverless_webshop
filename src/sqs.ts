import { Order } from "./orders/forms";

export interface SqsEvent{
  Records: Array<{ body: string }>
}
/*
{
  Records: [
    {
      messageId: '04f22445-decc-4834-ad2e-3d8dd697e7f3',
      receiptHandle: 'AQEBVTJDSyay5WKa2RvL3ylOdCCOCDBtpZdNzD/1M8+OGVAo9pQTNPQPFvuASac3qR73i1MRyPri1fyc4q+8hGuq9GJzr/kdmswpYpXPfLzZCoPC6AFqLjmZxopIvPU2FSrz7nHQyDh4dgQbZ0591GOiDxH6BbsDi5qNp8rpRWkRapwRmRB/PHiXTovfzgKYfW2Ctu/db+rh4WN1SY9qHyUrn0MQExtpfxYj07/HuaRxLiYzvj/vPpXyLbe1lffh0auWNWV7ibzT7p1RTcYnIGatbh/gb72FFu2Gp2ZF0+Nvs999ubyaTBSxbI34SxPKuDPBoRKtqleKsW6OABL/oMyaQW3QJKNzngs+pfz7iXEdB6pnpg23d9md9VOa1sFJf1MdfW40xWVhs4pAvPmJQ8G6lg==',
      body: '{\n"name": "Lucie"\n}',
      attributes: [Object],
      messageAttributes: {},
      md5OfBody: 'd21bfa963463cdd8a828ff00c573ce1f',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:eu-central-1:243037674803:OrderQueue',
      awsRegion: 'eu-central-1'
    }
  ]
}
*/