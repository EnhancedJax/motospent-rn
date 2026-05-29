import React from 'react';
import { StyleSheet } from 'react-native';

import { FormInput, type FormInputProps } from './form-input';

export const FormTextArea = React.forwardRef<React.ElementRef<typeof FormInput>, FormInputProps>(
  function FormTextArea(props, ref) {
    return (
      <FormInput
        ref={ref}
        multiline
        textAlignVertical="top"
        style={[styles.textArea, props.style]}
        {...props}
      />
    );
  },
);

const styles = StyleSheet.create({
  textArea: {
    minHeight: 96,
    paddingTop: 12,
  },
});
