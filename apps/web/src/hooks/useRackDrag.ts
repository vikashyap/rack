import type { DeviceTemplateConfig } from "@repo/config";
import { useShallow } from "zustand/react/shallow";

import type { RackDevice } from "@lib/rack-placement";
import {
  type RackDragItem,
  useRackInteractionStore,
} from "@stores/rackInteractionStore";
import { useGestureDrag } from "./useGestureDrag";

type RackDragSources = {
  templates: DeviceTemplateConfig[];
  devices: RackDevice[];
};

export function useRackDrag(item: RackDragItem, sources: RackDragSources) {
  const { endDrag, moveDrag, startDrag } = useRackInteractionStore(
    useShallow((state) => ({
      endDrag: state.endDrag,
      moveDrag: state.moveDrag,
      startDrag: state.startDrag,
    })),
  );

  return useGestureDrag(item, {
    onDragStart: startDrag,
    onDragMove: (_item, point) => moveDrag(point, sources),
    onDragEnd: (_item, point) => endDrag(point, sources),
  });
}
