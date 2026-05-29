import { router, useNavigation } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import DatePicker from "react-native-date-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DomainError, motorcyclesService } from "@/app-backend";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  FormField,
  FormInput,
  FormSwitch,
  FormTextArea,
} from "@/components/ui/form";
import { Spacing } from "@/constants/theme";
import type { MotorcycleDTO } from "@/core/database/types";
import { formatAppDate } from "@/core/format/format-app-date";
import { fromStorageKm } from "@/core/units/distance";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettings } from "@/hooks/use-settings";
import { useTheme } from "@/hooks/use-theme";
import { useMotorcycleUiStore } from "@/stores/motorcycle-ui-store";
import { radius } from "@/theme/radius";

import {
  MotorcycleFormPhoto,
  inferImageSourceMode,
  type ImageSourceMode,
} from "./motorcycle-form-photo";
import {
  motorcycleFormDefaultValues,
  validateMotorcycleForm,
  type MotorcycleFormValues,
} from "./motorcycle-form-schema";

type MotorcycleFormProps = {
  mode: "create" | "edit";
  motorcycle: MotorcycleDTO | null;
  isFirstMotorcycle: boolean;
};

export function MotorcycleForm({
  mode,
  motorcycle,
  isFirstMotorcycle,
}: MotorcycleFormProps) {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { distanceUnit } = useSettings();
  const unit = distanceUnit ?? "km";
  const setPendingSelectedId = useMotorcycleUiStore(
    (state) => state.setPendingSelectedId,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageSourceMode, setImageSourceMode] =
    useState<ImageSourceMode>("library");

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<MotorcycleFormValues>({
    defaultValues: motorcycleFormDefaultValues,
  });

  const imageUrl = watch("imageUrl");
  const purchaseDate = watch("purchaseDate");

  useEffect(() => {
    setSubmitError(null);
    if (mode === "edit" && motorcycle) {
      reset({
        name: motorcycle.name,
        odometerAtAddition: String(
          Math.round(
            fromStorageKm(motorcycle.odometerAtAdditionKm, unit) * 10,
          ) / 10,
        ),
        notes: motorcycle.notes ?? "",
        purchasePrice:
          motorcycle.purchasePrice != null
            ? String(motorcycle.purchasePrice)
            : "",
        purchaseDate: motorcycle.purchaseDate ?? undefined,
        imageUrl: motorcycle.imageUrl ?? undefined,
        isPrimary: motorcycle.isPrimary,
      });
      setImageSourceMode(inferImageSourceMode(motorcycle.imageUrl));
    } else {
      reset({
        ...motorcycleFormDefaultValues,
        isPrimary: isFirstMotorcycle,
      });
      setImageSourceMode("library");
    }
  }, [mode, motorcycle, isFirstMotorcycle, reset, unit]);

  const onSubmit = handleSubmit(async (values) => {
    const validation = validateMotorcycleForm(values, mode);
    if (!validation.success) {
      for (const [key, message] of Object.entries(validation.errors)) {
        setError(key as keyof MotorcycleFormValues, { message });
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { data } = validation;
      let saved: MotorcycleDTO;

      if (mode === "create") {
        saved = await motorcyclesService.create({
          name: data.name,
          notes: data.notes?.trim() || undefined,
          purchasePrice: data.purchasePrice,
          purchaseDate: data.purchaseDate,
          odometerAtAddition: data.odometer!,
          isPrimary: data.isPrimary,
          imageUrl: data.imageUrl,
        });
      } else if (motorcycle) {
        saved = await motorcyclesService.update(motorcycle.id, {
          name: data.name,
          notes: data.notes?.trim() || undefined,
          purchasePrice: data.purchasePrice,
          purchaseDate: data.purchaseDate,
          odometerAtAddition: data.odometer,
          isPrimary: data.isPrimary,
          imageUrl: data.imageUrl,
        });
      } else {
        return;
      }

      setPendingSelectedId(saved.id);
      router.back();
    } catch (error) {
      const message =
        error instanceof DomainError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Failed to save motorcycle";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  const submit = useCallback(() => {
    void onSubmit();
  }, [onSubmit]);

  useLayoutEffect(() => {
    if (Platform.OS !== "ios") {
      return;
    }

    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save motorcycle"
          disabled={isSubmitting}
          onPress={submit}
          hitSlop={8}
          style={[styles.headerSave, { opacity: isSubmitting ? 0.5 : 1 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText type="linkPrimary" style={styles.headerSaveLabel}>
              Save
            </ThemedText>
          )}
        </Pressable>
      ),
    });

    return () => {
      navigation.setOptions({ headerRight: undefined });
    };
  }, [navigation, submit, isSubmitting, theme.primary]);

  const showFooterSubmit = Platform.OS !== "ios";

  return (
    <ThemedView style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Platform.OS === "ios" ? 88 : Spacing.three,
            paddingBottom: Math.max(insets.bottom, Spacing.four),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <MotorcycleFormPhoto
            mode={imageSourceMode}
            onModeChange={setImageSourceMode}
            imageUrl={imageUrl}
            onImageUrlChange={(url) =>
              setValue("imageUrl", url, { shouldValidate: true })
            }
            error={errors.imageUrl?.message}
          />

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Name" error={errors.name?.message}>
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. Street Triple"
                  autoCapitalize="words"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="odometerAtAddition"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label={`Odometer (${unit})`}
                description={
                  mode === "edit"
                    ? "Leave blank to keep current baseline"
                    : undefined
                }
                error={errors.odometerAtAddition?.message}
              >
                <FormInput
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField label="Notes" error={errors.notes?.message}>
                <FormTextArea
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Optional notes"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="purchasePrice"
            render={({ field: { onChange, onBlur, value } }) => (
              <FormField
                label="Purchase price"
                error={errors.purchasePrice?.message}
              >
                <FormInput
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Optional"
                  keyboardType="decimal-pad"
                />
              </FormField>
            )}
          />

          <FormField label="Purchase date">
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowDatePicker(true)}
              style={[
                styles.dateButton,
                { backgroundColor: theme.muted, borderColor: theme.border },
              ]}
            >
              <ThemedText type="default">
                {purchaseDate
                  ? formatAppDate(purchaseDate)
                  : "Select date (optional)"}
              </ThemedText>
            </Pressable>
            {purchaseDate ? (
              <Pressable onPress={() => setValue("purchaseDate", undefined)}>
                <ThemedText type="linkPrimary">Clear date</ThemedText>
              </Pressable>
            ) : null}
          </FormField>

          <Controller
            control={control}
            name="isPrimary"
            render={({ field: { value, onChange } }) => (
              <FormSwitch
                label="Primary motorcycle"
                description="Used as the default when opening the app"
                value={value}
                onValueChange={onChange}
                disabled={isFirstMotorcycle && mode === "create"}
              />
            )}
          />

          {submitError ? (
            <ThemedText type="small" themeColor="destructive">
              {submitError}
            </ThemedText>
          ) : null}

          {showFooterSubmit ? (
            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={submit}
              style={[
                styles.submitButton,
                {
                  backgroundColor: theme.primary,
                  opacity: isSubmitting ? 0.7 : 1,
                },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.primaryForeground} />
              ) : (
                <ThemedText
                  style={{ color: theme.primaryForeground }}
                  type="smallBold"
                >
                  {mode === "create" ? "Add motorcycle" : "Save changes"}
                </ThemedText>
              )}
            </Pressable>
          ) : null}
        </View>
      </ScrollView>

      <DatePicker
        modal
        open={showDatePicker}
        date={purchaseDate ? new Date(purchaseDate) : new Date()}
        mode="date"
        title="Purchase date"
        theme={colorScheme === "dark" ? "dark" : "light"}
        onConfirm={(date) => {
          setShowDatePicker(false);
          setValue("purchaseDate", date.getTime(), { shouldValidate: true });
        }}
        onCancel={() => setShowDatePicker(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
  },
  form: {
    gap: Spacing.three,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: Spacing.two,
  },
  headerSave: {
    marginRight: Spacing.two,
    minWidth: 44,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  headerSaveLabel: {
    fontSize: 17,
  },
});
