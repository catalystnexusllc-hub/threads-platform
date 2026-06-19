import { Routes, Route } from 'react-router-dom'
import PlatformSelector from './pages/PlatformSelector/PlatformSelector'
import ArmyApp from './pages/army/ArmyApp'
import BranchApp from './pages/branch/BranchApp'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PlatformSelector />} />

      {/* Army */}
      <Route path="/army/*"        element={<ArmyApp />} />
      <Route path="/arng/*"        element={<BranchApp branchId="arng" />} />
      <Route path="/usar/*"        element={<BranchApp branchId="usar" />} />

      {/* Navy */}
      <Route path="/navy/*"        element={<BranchApp branchId="navy" />} />
      <Route path="/marines/*"     element={<BranchApp branchId="marines" />} />
      <Route path="/navyreserve/*" element={<BranchApp branchId="navyreserve" />} />
      <Route path="/usmcr/*"       element={<BranchApp branchId="usmcr" />} />

      {/* Air Force — Space Force routes here too */}
      <Route path="/airforce/*"    element={<BranchApp branchId="airforce" />} />
      <Route path="/spaceforce/*"  element={<BranchApp branchId="spaceforce" />} />
      <Route path="/ang/*"         element={<BranchApp branchId="ang" />} />
      <Route path="/afr/*"         element={<BranchApp branchId="afr" />} />

      {/* OSD */}
      <Route path="/osd/*"         element={<BranchApp branchId="osd" />} />

      {/* JCS & COCOMs */}
      <Route path="/jcs/*"         element={<BranchApp branchId="jcs" />} />
      <Route path="/socom/*"       element={<BranchApp branchId="socom" />} />
      <Route path="/stratcom/*"    element={<BranchApp branchId="stratcom" />} />
      <Route path="/transcom/*"    element={<BranchApp branchId="transcom" />} />
      <Route path="/cybercom/*"    element={<BranchApp branchId="cybercom" />} />
    </Routes>
  )
}
