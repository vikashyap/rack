import type { DeviceTemplateConfig } from "@repo/config";

import type { RackDevice } from "../lib/rack-placement";
import {
  type RackDragItem,
  useRackInteractionStore,
} from "../stores/rackInteractionStore";
import { useGestureDrag } from "./useGestureDrag";

type RackDragSources = {
  templates: DeviceTemplateConfig[];
  devices: RackDevice[];
};

export function useRackDrag(item: RackDragItem, sources: RackDragSources) {
  const startDrag = useRackInteractionStore((state) => state.startDrag);
  const moveDrag = useRackInteractionStore((state) => state.moveDrag);
  const endDrag = useRackInteractionStore((state) => state.endDrag);

  return useGestureDrag(item, {
    onDragStart: startDrag,
    onDragMove: (_item, point) => moveDrag(point, sources),
    onDragEnd: (_item, point) => endDrag(point, sources),
  });
}
