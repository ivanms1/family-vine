import { apiClient } from '@/lib/api-client';
import type {
  FamilyProfile,
  ChildProfile,
  AddChildInput,
  UpdateChildInput,
  SetChildPinInput,
  ChildLoginInput,
} from '@/types/family';

export const familyApi = {
  getFamily() {
    return apiClient.get<{ family: FamilyProfile }>('/api/family');
  },

  updateFamily(familyName: string) {
    return apiClient.patch<{ family: FamilyProfile }>('/api/family', {
      familyName,
    });
  },

  addChild(input: AddChildInput) {
    return apiClient.post<{ child: ChildProfile }>(
      '/api/family/children',
      input
    );
  },

  getChild(childId: string) {
    return apiClient.get<{ child: ChildProfile }>(
      `/api/family/children/${childId}`
    );
  },

  updateChild(childId: string, input: UpdateChildInput) {
    return apiClient.patch<{ child: ChildProfile }>(
      `/api/family/children/${childId}`,
      input
    );
  },

  deleteChild(childId: string) {
    return apiClient.delete<{ success: boolean }>(
      `/api/family/children/${childId}`
    );
  },

  setChildPin(childId: string, input: SetChildPinInput) {
    return apiClient.post<{ success: boolean }>(
      `/api/family/children/${childId}/pin`,
      input
    );
  },

  removeChildPin(childId: string) {
    return apiClient.post<{ success: boolean }>(
      `/api/family/children/${childId}/remove-pin`
    );
  },

  childLogin(input: ChildLoginInput) {
    return apiClient.post<{ child: ChildProfile }>(
      '/api/auth/child-login',
      input
    );
  },
};
