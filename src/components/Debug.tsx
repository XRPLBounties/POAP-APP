import React from "react";

import Box from "@mui/system/Box";

import config from "config";

function replacer(name: any, val: any) {
  if (val && val.type === "Buffer") {
    return "buffer";
  }
  return val;
}

type DebugWrapperProps = {
  enabled: boolean;
  children?: React.ReactNode;
};

function DebugWrapper(props: DebugWrapperProps) {
  const { enabled, children } = props;

  return enabled ? (
    <Box
      sx={{
        background: "lightgray",
        whiteSpace: "break-spaces",
      }}
    >
      {children}
    </Box>
  ) : null;
}

type DebugProps = {
  value: any;
  children?: React.ReactNode;
};

export function DebugRenderer(props: DebugProps) {
  const { value, children } = props;
  const target = value || children;

  const data = React.useMemo(() => {
    try {
      const str = JSON.stringify(target, replacer, 2);
      return str;
    } catch (err) {
      return `Failed to stringify: ${err}`;
    }
  }, [target]);

  return (
    <Box component="pre" sx={{ background: "gray", overflow: "hidden" }}>
      {data}
    </Box>
  );
}

export function Debug(props: DebugProps) {
  const { value, children } = props;
  return (
    <DebugWrapper enabled={config.debug}>
      <DebugRenderer children={children} value={value} />
    </DebugWrapper>
  );
}

export default Debug;
