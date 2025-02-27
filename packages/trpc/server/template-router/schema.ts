import { z } from 'zod';

import { SUPPORTED_LANGUAGE_CODES } from '@documenso/lib/constants/i18n';
import {
  ZDocumentAccessAuthTypesSchema,
  ZDocumentActionAuthTypesSchema,
} from '@documenso/lib/types/document-auth';
import { ZDocumentEmailSettingsSchema } from '@documenso/lib/types/document-email';
import { ZFindSearchParamsSchema } from '@documenso/lib/types/search-params';
import { isValidRedirectUrl } from '@documenso/lib/utils/is-valid-redirect-url';
import {
  DocumentDistributionMethod,
  DocumentSigningOrder,
  TemplateType,
} from '@documenso/prisma/client';

import { ZSignFieldWithTokenMutationSchema } from '../field-router/schema';

export const ZCreateTemplateMutationSchema = z.object({
  title: z.string().min(1).trim(),
  teamId: z.number().optional(),
  templateDocumentDataId: z.string().min(1),
});

export const ZCreateDocumentFromDirectTemplateMutationSchema = z.object({
  directRecipientName: z.string().optional(),
  directRecipientEmail: z.string().email(),
  directTemplateToken: z.string().min(1),
  directTemplateExternalId: z.string().optional(),
  signedFieldValues: z.array(ZSignFieldWithTokenMutationSchema),
  templateUpdatedAt: z.date(),
});

export const ZCreateDocumentFromTemplateMutationSchema = z.object({
  templateId: z.number(),
  teamId: z.number().optional(),
  recipients: z
    .array(
      z.object({
        id: z.number(),
        email: z.string().email(),
        name: z.string().optional(),
      }),
    )
    .refine((recipients) => {
      const emails = recipients.map((signer) => signer.email);
      return new Set(emails).size === emails.length;
    }, 'Recipients must have unique emails'),
  distributeDocument: z.boolean().optional(),
  customDocumentDataId: z.string().optional(),
});

export const ZDuplicateTemplateMutationSchema = z.object({
  templateId: z.number(),
  teamId: z.number().optional(),
});

export const ZCreateTemplateDirectLinkMutationSchema = z.object({
  templateId: z.number().min(1),
  teamId: z.number().optional(),
  directRecipientId: z.number().min(1).optional(),
});

export const ZDeleteTemplateDirectLinkMutationSchema = z.object({
  templateId: z.number().min(1),
});

export const ZToggleTemplateDirectLinkMutationSchema = z.object({
  templateId: z.number().min(1),
  enabled: z.boolean(),
});

export const ZDeleteTemplateMutationSchema = z.object({
  templateId: z.number().min(1),
  teamId: z.number().optional(),
});

export const MAX_TEMPLATE_PUBLIC_TITLE_LENGTH = 50;
export const MAX_TEMPLATE_PUBLIC_DESCRIPTION_LENGTH = 256;

export const ZUpdateTemplateSettingsMutationSchema = z.object({
  templateId: z.number(),
  teamId: z.number().min(1).optional(),
  data: z.object({
    title: z.string().min(1).optional(),
    externalId: z.string().nullish(),
    globalAccessAuth: ZDocumentAccessAuthTypesSchema.nullable().optional(),
    globalActionAuth: ZDocumentActionAuthTypesSchema.nullable().optional(),
    publicTitle: z.string().trim().min(1).max(MAX_TEMPLATE_PUBLIC_TITLE_LENGTH).optional(),
    publicDescription: z
      .string()
      .trim()
      .min(1)
      .max(MAX_TEMPLATE_PUBLIC_DESCRIPTION_LENGTH)
      .optional(),
    type: z.nativeEnum(TemplateType).optional(),
    language: z
      .union([z.string(), z.enum(SUPPORTED_LANGUAGE_CODES)])
      .optional()
      .default('en'),
  }),
  meta: z
    .object({
      subject: z.string(),
      message: z.string(),
      timezone: z.string(),
      dateFormat: z.string(),
      distributionMethod: z.nativeEnum(DocumentDistributionMethod),
      emailSettings: ZDocumentEmailSettingsSchema,
      redirectUrl: z
        .string()
        .optional()
        .refine((value) => value === undefined || value === '' || isValidRedirectUrl(value), {
          message:
            'Please enter a valid URL, make sure you include http:// or https:// part of the url.',
        }),
      language: z.enum(SUPPORTED_LANGUAGE_CODES).optional(),
      typedSignatureEnabled: z.boolean().optional(),
    })
    .optional(),
});

export const ZSetSigningOrderForTemplateMutationSchema = z.object({
  templateId: z.number(),
  teamId: z.number().optional(),
  signingOrder: z.nativeEnum(DocumentSigningOrder),
});

export const ZFindTemplatesQuerySchema = ZFindSearchParamsSchema.extend({
  teamId: z.number().optional(),
  type: z.nativeEnum(TemplateType).optional(),
});

export const ZGetTemplateByIdQuerySchema = z.object({
  templateId: z.number().min(1),
  teamId: z.number().optional(),
});

export const ZMoveTemplatesToTeamSchema = z.object({
  templateId: z.number(),
  teamId: z.number(),
});

export const ZUpdateTemplateTypedSignatureSettingsMutationSchema = z.object({
  templateId: z.number(),
  teamId: z.number().optional(),
  typedSignatureEnabled: z.boolean(),
});

export type TCreateTemplateMutationSchema = z.infer<typeof ZCreateTemplateMutationSchema>;
export type TCreateDocumentFromTemplateMutationSchema = z.infer<
  typeof ZCreateDocumentFromTemplateMutationSchema
>;
export type TDuplicateTemplateMutationSchema = z.infer<typeof ZDuplicateTemplateMutationSchema>;
export type TDeleteTemplateMutationSchema = z.infer<typeof ZDeleteTemplateMutationSchema>;
export type TGetTemplateByIdQuerySchema = z.infer<typeof ZGetTemplateByIdQuerySchema>;
export type TMoveTemplatesToSchema = z.infer<typeof ZMoveTemplatesToTeamSchema>;
