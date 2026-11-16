using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR;

namespace ISDOnline.Financial
{
    /// <summary>
    /// Manages XR subsystem detection, tracking space initialization,
    /// and graceful fallback for non-XR platforms (Desktop & Mobile Standalone).
    /// </summary>
    public class XRDeviceController : MonoBehaviour
    {
        [Header("XR Configuration")]
        [SerializeField] private TrackingSpaceType trackingSpace = TrackingSpaceType.Stationary;
        [SerializeField] private bool autoRecenterOnStart = true;

        [Header("Diagnostics & Status")]
        [SerializeField] private bool isXRActive = false;
        [SerializeField] private string activeXRDeviceName = "None";

        public bool IsXRActive => isXRActive;
        public string ActiveXRDeviceName => activeXRDeviceName;

        private void Start()
        {
            CheckXRHardware();
            ConfigureTrackingSpace();
        }

        public void CheckXRHardware()
        {
            isXRActive = XRSettings.isDeviceActive;
            activeXRDeviceName = XRSettings.loadedDeviceName;

            if (isXRActive)
            {
                Debug.Log($"[XRDeviceController] Active XR Device Detected: {activeXRDeviceName}");
            }
            else
            {
                Debug.Log("[XRDeviceController] No XR Headset connected. Initialized in Desktop / Mobile Touch mode.");
            }
        }

        private void ConfigureTrackingSpace()
        {
            var inputSubsystems = new List<XRInputSubsystem>();
            SubsystemManager.GetInstances(inputSubsystems);

            foreach (var subsystem in inputSubsystems)
            {
                if (subsystem.running)
                {
                    subsystem.TrySetTrackingOriginMode(TrackingOriginModeFlags.Floor);
                    if (autoRecenterOnStart)
                    {
                        subsystem.TryRecenter();
                    }
                }
            }
        }

        /// <summary>
        /// Recenter tracking origin programmatically.
        /// </summary>
        public void RecenterPose()
        {
            InputTracking.Recenter();
            Debug.Log("[XRDeviceController] Headset pose recentered.");
        }
    }
}
