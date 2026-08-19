from PIL import Image, ImageFilter
import numpy as np

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img, dtype=np.float64)
    
    # 1. Sample background color from image corners and outer perimeter
    border_pixels = np.concatenate([
        arr[:10, :, :3].reshape(-1, 3),
        arr[-10:, :, :3].reshape(-1, 3),
        arr[:, :10, :3].reshape(-1, 3),
        arr[:, -10:, :3].reshape(-1, 3)
    ], axis=0)
    
    bg_color = np.median(border_pixels, axis=0)
    print(f"Detected Background Color: {bg_color}")
    
    # 2. Color Euclidean distance from background
    rgb = arr[:, :, :3]
    diff = np.sqrt(np.sum((rgb - bg_color) ** 2, axis=2))
    
    # Thresholds for smooth anti-aliased edge
    t_low = 8.0
    t_high = 32.0
    
    alpha = np.clip((diff - t_low) / (t_high - t_low), 0.0, 1.0)
    
    # Smooth step curve: 3x^2 - 2x^3
    alpha_smooth = 3 * (alpha ** 2) - 2 * (alpha ** 3)
    
    # 3. Decontaminate foreground edge pixels (un-premultiply background color)
    # C = alpha * F + (1 - alpha) * B => F = (C - (1 - alpha) * B) / alpha
    fg = np.zeros_like(rgb)
    valid_alpha = alpha_smooth > 0.02
    
    for c in range(3):
        fg[:, :, c] = np.where(
            valid_alpha,
            np.clip((rgb[:, :, c] - (1.0 - alpha_smooth) * bg_color[c]) / np.maximum(alpha_smooth, 0.05), 0, 255),
            rgb[:, :, c]
        )
    
    # 4. Assemble RGBA image
    result = np.zeros_like(arr, dtype=np.uint8)
    result[:, :, :3] = np.clip(fg, 0, 255).astype(np.uint8)
    result[:, :, 3] = (alpha_smooth * 255.0).astype(np.uint8)
    
    out_img = Image.fromarray(result, 'RGBA')
    
    # Optional: crop excess transparent borders with small padding
    bbox = out_img.getbbox()
    if bbox:
        # Add 5% padding around bbox to keep aesthetic balance
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        pad_x = int(w * 0.08)
        pad_y = int(h * 0.08)
        padded_bbox = (
            max(0, bbox[0] - pad_x),
            max(0, bbox[1] - pad_y),
            min(img.width, bbox[2] + pad_x),
            min(img.height, bbox[3] + pad_y)
        )
        out_img = out_img.crop(padded_bbox)
    
    # Resize to standard square (e.g. 512x512) for perfect rendering
    out_img = out_img.resize((512, 512), Image.Resampling.LANCZOS)
    out_img.save(output_path, 'PNG', optimize=True)
    print(f"Successfully saved transparent logo to {output_path}")

if __name__ == '__main__':
    remove_background('apps/web/public/logo.png', 'apps/web/public/logo.png')
