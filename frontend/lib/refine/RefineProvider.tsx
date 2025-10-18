"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/react-router-v6";
import { dataProvider } from "./providers/dataProvider";
import { authProvider } from "./providers/authProvider";
import { notificationProvider } from "./providers/notificationProvider";

interface RefineProviderProps {
  children: React.ReactNode;
}

/**
 * Refine provider wrapper component.
 * 
 * Phase 1: ✅ Uses stub providers for initial setup
 * Phase 2: ✅ Real data provider integrated
 * Phase 7: ✅ Firebase auth provider integrated
 * Phase 8: ✅ DaisyUI notification provider integrated
 */
export function RefineProvider({ children }: RefineProviderProps) {
  return (
    <Refine
      dataProvider={dataProvider}
      authProvider={authProvider}
      notificationProvider={notificationProvider}
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
