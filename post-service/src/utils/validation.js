import joi from 'joi';

export const ValidateCreatePost = data => {
  const schema = joi.object({
    content: joi.string().min(3).max(500).required(),
    mediaIds: joi.array().items(joi.string()),
  });
  return schema.validate(data);
};
