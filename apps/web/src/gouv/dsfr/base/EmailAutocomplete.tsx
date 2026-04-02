"use client";

import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { cx } from "@codegouvfr/react-dsfr/tools/cx";
import Autocomplete from "@mui/material/Autocomplete";
import { useCallback, useEffect, useRef, useState } from "react";

import { type UserEmailSearchResult } from "@/lib/repo/IUserRepo";

type EmailAutocompleteProps = {
  className?: string;
  clearOnSelect?: boolean;
  disabled?: boolean;
  label?: string;
  onSelectAction: (email: string) => void;
  searchAction: (query: string) => Promise<UserEmailSearchResult[]>;
  value?: string;
};

export const EmailAutocomplete = ({
  className,
  clearOnSelect = true,
  disabled,
  label = "Email",
  onSelectAction,
  searchAction,
  value: controlledValue,
}: EmailAutocompleteProps) => {
  const [options, setOptions] = useState<UserEmailSearchResult[]>([]);
  const [inputValue, setInputValue] = useState(controlledValue ?? "");
  const debounceRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.length < 2) {
        setOptions([]);
        return;
      }
      debounceRef.current = setTimeout(() => {
        void searchAction(value).then(setOptions);
      }, 300);
    },
    [searchAction],
  );

  return (
    <SearchBar
      className={className}
      label={label}
      renderInput={({ className: inputClassName, id, placeholder, type }) => (
        <Autocomplete
          className="flex-1"
          freeSolo
          disabled={disabled}
          options={options}
          inputValue={inputValue}
          filterOptions={x => x}
          getOptionLabel={option => (typeof option === "string" ? option : option.email)}
          isOptionEqualToValue={(option, val) => option.email === (typeof val === "string" ? val : val.email)}
          onChange={(_event, newValue) => {
            if (newValue) {
              const email = typeof newValue === "string" ? newValue : newValue.email;
              onSelectAction(email);
              if (clearOnSelect) {
                setInputValue("");
              } else {
                setInputValue(email);
              }
              setOptions([]);
            }
          }}
          onInputChange={(_event, newInputValue, reason) => {
            if (reason === "input") {
              handleInputChange(newInputValue);
            } else if (reason === "reset" && clearOnSelect) {
              setInputValue("");
            }
          }}
          renderInput={params => (
            <div ref={params.InputProps.ref}>
              <input
                {...params.inputProps}
                className={cx(params.inputProps.className, inputClassName)}
                id={id}
                placeholder={placeholder}
                type={type}
              />
            </div>
          )}
          renderOption={(props, option) => {
            const { key, ...rest } = props as { key: string } & React.HTMLAttributes<HTMLLIElement>;
            return (
              <li key={key} {...rest}>
                {typeof option === "string" ? option : option.name ? `${option.name} (${option.email})` : option.email}
              </li>
            );
          }}
        />
      )}
    />
  );
};
