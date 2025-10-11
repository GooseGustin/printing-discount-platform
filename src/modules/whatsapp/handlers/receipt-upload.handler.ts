// src/modules/whatsapp/handlers/receipt-upload.handler.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { TransactionsService } from '../../transactions/transactions.service';
import { ReceiptsService } from '../../receipts/receipts.service';
import { SessionService } from '../../sessions/sessions.service';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ReceiptUploadHandler {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly receiptsService: ReceiptsService,
    private readonly sessionService: SessionService,
  ) {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async handleResponse(userId: string, message: any, type: string) {
    if (type !== 'image') {
      return { text: { body: 'Please upload an image of your payment receipt.' } };
    }

    try {
      // Step 1: Download the image from WhatsApp
      const mediaId = message.mediaId;
      const mediaUrl = await this.fetchMediaUrl(mediaId);
      const mediaBuffer = await this.downloadMedia(mediaUrl);

      // Step 2: Upload to Cloudinary
      const uploadedUrl: string = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'receipts',
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(mediaBuffer);
      });

      // Step 3: Create receipt record
      await this.receiptsService.uploadReceipt(userId, uploadedUrl);

      // Step 4: Reset session
      await this.sessionService.resetToMainMenu(userId);

      return { text: { body: '✅ Receipt uploaded successfully! It will be reviewed shortly.' } };
    } catch (error) {
      console.error(error);
      return { text: { body: `❌ Failed to upload your receipt. Please try again. ${error.message}` } };
    }
  }

  private async fetchMediaUrl(mediaId: string) {
    const token = process.env.WHATSAPP_TOKEN;
    const res = await axios.get(`https://graph.facebook.com/v21.0/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.url;
  }

  private async downloadMedia(url: string) {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` },
      responseType: 'arraybuffer',
    });
    return res.data;
  }
}
