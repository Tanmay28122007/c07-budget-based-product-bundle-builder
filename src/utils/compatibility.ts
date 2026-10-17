import { Product, CompatibilityViolation } from '../types';

/**
 * Validates compatibility across a list of selected products.
 * Returns an array of any identified violations with human-readable explanations.
 */
export function checkCompatibility(products: (Product | null | undefined)[]): CompatibilityViolation[] {
  const violations: CompatibilityViolation[] = [];
  const validProducts = products.filter((p): p is Product => Boolean(p));

  // Find specific products by category
  const desk = validProducts.find(p => p.category === 'desk');
  const chair = validProducts.find(p => p.category === 'chair');
  const monitor = validProducts.find(p => p.category === 'monitor');
  const dock = validProducts.find(p => p.category === 'laptop_stand_or_dock');
  const lighting = validProducts.find(p => p.category === 'lighting');

  // Rule 1: Explicit ID incompatibility list
  for (let i = 0; i < validProducts.length; i++) {
    for (let j = i + 1; j < validProducts.length; j++) {
      const p1 = validProducts[i];
      const p2 = validProducts[j];

      if (p1.incompatibleProductIds?.includes(p2.id)) {
        violations.push({
          severity: 'error',
          ruleId: 'explicit_id_block',
          sourceProductId: p1.id,
          sourceProductName: p1.name,
          targetProductId: p2.id,
          targetProductName: p2.name,
          message: `${p1.name} (${p1.id}) is directly incompatible with ${p2.name} (${p2.id}) due to hardware port discrepancy.`
        });
      } else if (p2.incompatibleProductIds?.includes(p1.id)) {
        violations.push({
          severity: 'error',
          ruleId: 'explicit_id_block',
          sourceProductId: p2.id,
          sourceProductName: p2.name,
          targetProductId: p1.id,
          targetProductName: p1.name,
          message: `${p2.name} (${p2.id}) is directly incompatible with ${p1.name} (${p1.id}) due to hardware port discrepancy.`
        });
      }
    }
  }

  // Rule 2: Desk Width vs Ultrawide Monitor (desk_width_vs_ultrawide)
  if (desk && monitor) {
    const isUltrawide = monitor.name.toLowerCase().includes('ultrawide') ||
      monitor.name.toLowerCase().includes('34-inch') ||
      monitor.name.toLowerCase().includes('curved');
    const deskWidth = desk.attributes?.deskWidthCm || 120;

    if (isUltrawide && deskWidth < 120) {
      violations.push({
        severity: 'error',
        ruleId: 'desk_width_vs_ultrawide',
        sourceProductId: monitor.id,
        sourceProductName: monitor.name,
        targetProductId: desk.id,
        targetProductName: desk.name,
        message: `Ultrawide display (${monitor.name}) spans wide geometry requiring at least 120cm desk surface. Selected desk (${desk.name}) is only ${deskWidth}cm wide, causing extreme overhang and tipping risk.`
      });
    }
  }

  // Rule 3: ScreenBar Light vs Curved Display (clamp_vs_monitor)
  if (lighting && monitor) {
    const isScreenClampLight = lighting.attributes?.lightMountType === 'screen_clamp';
    const isCurvedMonitor = monitor.name.toLowerCase().includes('curved') ||
      monitor.description.toLowerCase().includes('curvature') ||
      monitor.description.toLowerCase().includes('1500r');

    if (isScreenClampLight && isCurvedMonitor) {
      violations.push({
        severity: 'error',
        ruleId: 'clamp_vs_monitor',
        sourceProductId: lighting.id,
        sourceProductName: lighting.name,
        targetProductId: monitor.id,
        targetProductName: monitor.name,
        message: `The ScreenBar clamp light (${lighting.name}) requires a flat top monitor bezel. It cannot mount safely on curved chassis (${monitor.name}). A weighted base task lamp (e.g. SN-LAMP) is required instead.`
      });
    }
  }

  // Rule 4: Wide Executive Chair vs Compact Desk (chair_clearance)
  if (chair && desk) {
    const isFixedArmChair = chair.attributes?.chairArmrest === 'fixed' || chair.name.toLowerCase().includes('executive');
    const isCompactDesk = (desk.attributes?.deskWidthCm || 120) < 100 || (desk.attributes?.deskDepthCm || 60) < 60;

    if (isFixedArmChair && isCompactDesk) {
      violations.push({
        severity: 'error',
        ruleId: 'chair_clearance',
        sourceProductId: chair.id,
        sourceProductName: chair.name,
        targetProductId: desk.id,
        targetProductName: desk.name,
        message: `Executive chair (${chair.name}) has wide non-retractable fixed arms that cannot tuck under compact workstation (${desk.name}), causing severe ergonomic posture strain.`
      });
    }
  }

  return violations;
}

/**
 * Checks whether adding a candidate product to an existing bundle would introduce any incompatibility.
 * Useful for the product selection modal/drawer.
 */
export function checkCandidateCompatibility(
  candidate: Product,
  currentItems: Record<string, Product | null>,
  currentSlotId: string
): { isCompatible: boolean; reasons: string[] } {
  // Create hypothetical bundle
  const hypotheticalItems = Object.entries(currentItems)
    .filter(([slotId]) => slotId !== currentSlotId)
    .map(([, prod]) => prod)
    .filter((p): p is Product => Boolean(p));

  hypotheticalItems.push(candidate);

  const violations = checkCompatibility(hypotheticalItems);
  const relevantViolations = violations.filter(
    v => v.sourceProductId === candidate.id || v.targetProductId === candidate.id
  );

  return {
    isCompatible: relevantViolations.length === 0,
    reasons: relevantViolations.map(v => v.message)
  };
}
