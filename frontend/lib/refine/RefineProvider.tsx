"use client";

import { Refine } from "@refinedev/core";
import { stubDataProvider } from "./providers/stubDataProvider";
import { stubAuthProvider } from "./providers/stubAuthProvider";
import { stubNotificationProvider } from "./providers/stubNotificationProvider";

interface RefineProviderProps {
  children: React.ReactNode;
}

/**
 * Refine provider wrapper component.
 * 
 * Phase 1: Uses stub providers for initial setup
 * Phase 2: Will integrate real data provider
 * Phase 7: Will integrate Firebase auth provider
 * Phase 8: Will integrate DaisyUI notification provider
 */
export function RefineProvider({ children }: RefineProviderProps) {
  return (
    <Refine
      dataProvider={stubDataProvider}
      authProvider={stubAuthProvider}
      notificationProvider={stubNotificationProvider}
      resources={[
        {
          name: "trips",
          list: "/",
          show: "/trip/:id",
          edit: "/trip/:id/edit",
        },
        {
          name: "activities",
        },
        {
          name: "hotels",
        },
        {
          name: "flights",
        },
        {
          name: "restaurants",
        },
      ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        disableTelemetry: true,
      }}
    >
      {children}
    </Refine>
  );
}
