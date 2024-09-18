import { z } from "zod";
import { useForm, zodResolver } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  NumberInput,
  Paper,
  Title,
  Text,
  Box,
  Select,
  Notification,
  rem,
  Alert,
} from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { importArticles } from "../../api";
import { FormEvent, useState } from "react";
import { IconCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { CATEGORIES } from "./categories";

const schema = z
  .object({
    text: z.string().optional(),
    category: z.string().optional(),
    tag: z.string().optional(),
    size: z
      .number()
      .min(1, { message: "You must import at least one article." }),
  })
  .refine((data) => data.text || data.category || data.tag, {
    message:
      "At least one of 'Keyword text search' or 'Category' or 'Tag' fields must be provided.",
    path: ["text", "category", "tag"],
  });

export function ImportArticles() {
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState([CATEGORIES.map((cat) => ({ value: cat.value, label: cat.value }))]);

  const form = useForm({
    validate: zodResolver(schema),
    initialValues: {
      text: "",
      category: "",
      tag: "",
      size: 20,
    },
  });

  const mutation = useMutation({
    mutationFn: importArticles,
    onSuccess: (import_count) => {
      setSuccessMessage(`Successfully imported ${import_count} articles!`);
    },
    onError: () => {
      setErrorMessage("Failed to import articles.");
    },
  });

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    const validationResult = form.validate();

    if (validationResult.hasErrors) {
      console.log("validationResult.errors:", validationResult.errors);
      return;
    }
    if (form.isValid()) {
      mutation.mutate(form.values);
    }
  };

  const handleNotificationClose = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleCategoryChange = (value: string, level: number) => {
    const newSelectedCategories = selectedCategories.slice(0, level+1);
    newSelectedCategories.push(value);
    setSelectedCategories(newSelectedCategories);

    const newCategoryOptions = [...categoryOptions];
    let children = CATEGORIES;
    for (let i = 0; i <= level; i++) {
      const category = children.find((cat) => cat.value === newSelectedCategories[i]);
      children = category?.children || [];
      newCategoryOptions[level+1] = children.map((cat) => ({ value: cat.value, label: cat.value }));
    }
    setCategoryOptions(newCategoryOptions.slice(0, level + 2));

    form.setValues({category: value });
  };

  return (
    <Box p="lg">
      <Paper maw={640} mx="auto" shadow="xs" p="lg">
        <Title order={2} mb="lg">
          Article Importer
        </Title>
        <Alert variant="light" color="blue" icon={<IconInfoCircle />} mb="lg">
          The Article API from Diffbot lets you fetch real-time news efficiently
          based on the keyword or topic you are interested in. It stores the
          results as a lexical graph in Neo4j, which is a graph structure
          representing the relationships between articles and corresponding text
          chunks.
        </Alert>
        {successMessage ? (
          <Notification
            icon={<IconCheck style={{ width: rem(20), height: rem(20) }} />}
            color="teal"
            title="Done!"
            mt="md"
            withBorder
            style={{ boxShadow: "none" }}
            onClose={handleNotificationClose}
          >
            {successMessage}
          </Notification>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <TextInput
              label="Keyword text search"
              placeholder="Example: Neo4j Inc"
              {...form.getInputProps("text")}
            />
            <Select
              label="Category"
              placeholder="Select a category"
              data={[...categoryOptions][0]}
              value={selectedCategories[0] || ""}
              onChange={(value) => handleCategoryChange(value ?? "", 0)}
              mt="sm"
            />
            {selectedCategories.map(
              (_, index) =>
                categoryOptions[index + 1].length > 0 && (
                  <Select
                    key={index + 1}
                    label="Subcategory"
                    placeholder="Select a subcategory"
                    data={categoryOptions[index + 1]}
                    onChange={(value) =>
                      handleCategoryChange(value ?? "", index + 1)
                    }
                    mt="sm"
                  />
                ),
            )}
            <TextInput
              label="Tag"
              placeholder="Examples: LLM, Artificial Intelligence, Natural Language Processing, Semantic Web"
              {...form.getInputProps("tag")}
            />
            <NumberInput
              withAsterisk
              label="Number of articles"
              mt="sm"
              min={1}
              max={99}
              {...form.getInputProps("size")}
            />
            {errorMessage && (
              <Notification
                icon={<IconX style={{ width: rem(20), height: rem(20) }} />}
                withBorder
                color="red"
                title="Error!"
                mt="lg"
                style={{ boxShadow: "none" }}
                onClose={handleNotificationClose}
              >
                {errorMessage}
              </Notification>
            )}
            {form.errors["text.category.tag"] && (
              <Notification
                icon={<IconX style={{ width: rem(20), height: rem(20) }} />}
                withBorder
                color="red"
                title="Error!"
                mt="lg"
                style={{ boxShadow: "none" }}
                withCloseButton={false}
              >
                {form.errors["text.category.tag"]}
              </Notification>
            )}
            <Group mt="lg">
              <Button color="teal" loading={mutation.isPending} type="submit">
                Submit
              </Button>
            </Group>
          </form>
        )}
      </Paper>
    </Box>
  );
}
