import * as React from 'react';
import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';

export default async function MinHeightTextarea() {
  return (
    <BaseTextareaAutosize aria-label="minimum height" minRows={3} placeholder="Minimum 3 rows" />
  );
}