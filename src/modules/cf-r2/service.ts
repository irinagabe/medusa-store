import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

import { Logger, ProviderDeleteFileDTO, ProviderFileResultDTO, ProviderUploadFileDTO } from "@medusajs/framework/types"
import { AbstractFileProviderService, MedusaError } from "@medusajs/framework/utils"

import crypto from "crypto"

type InjectDependencies = {
  logger: Logger
}

type Options = {
  publicUrl: string
  accessKeyId: string
  secretAccessKey: string
  bucket: string
  endpoint: string
}

class CFR2FileProviderService extends AbstractFileProviderService {
  protected logger_: Logger
  protected options_: Options
  static identifier = 'cf-r2'
  protected client: S3Client

  constructor({ logger }: InjectDependencies, options: Options) {
    super()
    this.logger_ = logger
    this.options_ = options

    const accessKeyId = options.accessKeyId
    const secretAccessKey = options.secretAccessKey
    const hashedSecretAccessKey = crypto.createHash('sha256').update(secretAccessKey).digest('hex')
    const endpoint = options.endpoint

    this.client = new S3Client({
      region: "auto",
      endpoint: endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey: hashedSecretAccessKey
      },
    })
  }

  static validateOptions(options: Record<any, any>): void | never {

    if (!options.publicUrl) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "PUBLIC_URL is required in the provider's options"
      )
    } else if (!options.accessKeyId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "ACCESS_KEY_ID is required in the provider's options"
      )
    } else if (!options.secretAccessKey) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "SECRET_ACCESS_KEY is required in the provider's options"
      )
    } else if (!options.bucket) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "BUCKET is required in the provider's options"
      )
    } else if (!options.endpoint) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "ENDPOINT is required in the provider's options"
      )
    }
  }

  async upload(file: ProviderUploadFileDTO): Promise<ProviderFileResultDTO> {
    const key = `${Date.now()}-${file.filename}`

    try {
      this.logger_.info(`Uploading ${key} to ${this.options_.bucket}`)

      await this.client.send(new PutObjectCommand({
        Bucket: this.options_.bucket,
        Key: key,
        Body: file.content,
        ContentType: file.mimeType
      }))

      this.logger_.info(`Uploaded ${key} to ${this.options_.bucket}`)

      return {
        url: `https://${this.options_.publicUrl}/${this.options_.bucket}/${key}`,
        key: key
      }
    } catch (error) {
      this.logger_.error(`Failed to upload ${key} to ${this.options_.bucket}`, error.message)

      throw error
    }
  }

  async delete(file: ProviderDeleteFileDTO): Promise<void> {
    const key = `${Date.now()}-${file.filename}`
    try {
      await this.client.send(new DeleteObjectCommand({
        Bucket: this.options_.bucket,
        Key: file.fileKey,
      }))

      this.logger_.info(`Deleted ${key} from ${this.options_.bucket}`)
    } catch (error) {
      this.logger_.error(`Failed to delete ${key} from ${this.options_.bucket}`, error)

      throw error
    }
  }

}

export default CFR2FileProviderService