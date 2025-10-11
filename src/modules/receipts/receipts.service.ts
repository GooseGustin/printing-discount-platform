import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Receipt } from '../../models/receipt.model';
import { Transaction } from '../../models/transaction.model';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ReceiptsService {
  constructor(
    @InjectModel(Receipt) private readonly receiptModel: typeof Receipt,
    @InjectModel(Transaction)
    private readonly transactionModel: typeof Transaction,
  ) {
    // Initialize Cloudinary (only once)
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  /**
   * Create and link a new receipt to the latest pending transaction of a user.
   * If no pending transaction exists, throws an error.
   */
  async uploadReceipt(userId: string, imageUrl: string) {
    // Step 1. Verify pending transaction
    const pendingTx = await this.transactionModel.findOne({
      where: { userId, status: 'pending' },
      order: [['uploadedAt', 'DESC']],
    });

    if (!pendingTx) {
      throw new BadRequestException(
        'No pending transaction found to attach receipt.',
      );
    }

    // Step 2. Upload to Cloudinary
    let uploadedImageUrl = imageUrl;
    // try {
    //   const result = await cloudinary.uploader.upload(imageUrl, {
    //     folder: 'receipts',
    //     public_id: `receipt_${userId}_${Date.now()}`,
    //     resource_type: 'image',
    //   });
    //   uploadedImageUrl = result.secure_url;
    // } catch (error) {
    //   console.error('Cloudinary upload failed:', error.message);
    //   throw new BadRequestException(
    //     'Failed to upload receipt image. Please try again.',
    //   );
    // }

    // Step 3. Create receipt record
    const receipt = await this.receiptModel.create({
      userId,
      transactionId: pendingTx.id,
      imageUrl: uploadedImageUrl,
      status: 'pending',
      uploadedAt: new Date(),
    });

    return {
      message: 'Receipt uploaded successfully.',
      receiptId: receipt.id,
      transactionRef: pendingTx.reference,
      imageUrl: uploadedImageUrl,
    };
  }

  /**
   * Find all receipts for a given user.
   */
  async findByUser(userId: string) {
    return this.receiptModel.findAll({
      where: { userId },
      include: [Transaction],
      order: [['uploadedAt', 'DESC']],
    });
  }

  /**
   * Admin: Approve a receipt.
   */
  async approveReceipt(receiptId: string) {
    const receipt = await this.receiptModel.findByPk(receiptId);
    if (!receipt) throw new NotFoundException('Receipt not found');

    await receipt.update({ status: 'approved' });

    const tx = await this.transactionModel.findByPk(receipt.transactionId);
    if (tx) await tx.update({ status: 'approved' });

    return receipt;
  }

  /**
   * Admin: Reject a receipt.
   */
  async rejectReceipt(receiptId: string, reason?: string) {
    const receipt = await this.receiptModel.findByPk(receiptId);
    if (!receipt) throw new NotFoundException('Receipt not found');

    const transaction = receipt.transaction;
    if (!transaction) {
      throw new BadRequestException('No transaction linked to this receipt.');
    }

    if (receipt.status !== 'pending') {
      throw new BadRequestException('This receipt has already been processed.');
    }
    
    await receipt.update({ status: 'rejected' });

    const tx = await this.transactionModel.findByPk(receipt.transactionId);
    if (tx) await tx.update({ status: 'rejected' });

    return { receipt, message: reason || 'Receipt rejected.' };
  }

  /**
   * Find the latest pending receipt for a user (useful for user notifications)
   */
  async findLatestPending(userId: string) {
    return this.receiptModel.findOne({
      where: { userId, status: 'pending' },
      order: [['uploadedAt', 'DESC']],
      include: [Transaction],
    });
  }
}
